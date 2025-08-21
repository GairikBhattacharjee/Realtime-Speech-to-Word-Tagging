from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
import re
from collections import Counter
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

jwt = JWTManager(app)
CORS(app)

mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_database()
users_collection = db['users']
speeches_collection = db['speeches']

# Helper functions
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc:
        doc['id'] = str(doc['_id'])
        del doc['_id']
    return doc

def clean_text(text):
    """Clean and normalize text for comparison"""
    text = re.sub(r'[^\w\s]', '', text.lower())
    words = [word.strip() for word in text.split() if word.strip()]
    return words

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            return jsonify({'message': 'All fields are required'}), 400

        if users_collection.find_one({'email': email}):
            return jsonify({'message': 'Email already registered'}), 400

        if users_collection.find_one({'username': username}):
            return jsonify({'message': 'Username already taken'}), 400

        hashed_password = generate_password_hash(password)
        user_doc = {
            'username': username,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }

        result = users_collection.insert_one(user_doc)
        user_doc['id'] = str(result.inserted_id)
        del user_doc['_id']
        del user_doc['password']

        access_token = create_access_token(identity=str(result.inserted_id))

        return jsonify({
            'token': access_token,
            'user': user_doc,
            'message': 'User registered successfully'
        }), 201

    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user
        user = users_collection.find_one({'email': email})
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user['_id']))
        
        user_data = serialize_doc(user)
        del user_data['password']
        
        return jsonify({
            'token': access_token,
            'user': user_data,
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        user_data = serialize_doc(user)
        del user_data['password']
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get profile', 'error': str(e)}), 500

@app.route('/api/speeches', methods=['POST'])
@jwt_required()
def save_speech():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        text = data.get('text', '').strip()
        speech_type = data.get('type', 'reference')
        
        if not text:
            return jsonify({'message': 'Speech text is required'}), 400
        
        if speech_type not in ['reference', 'comparison']:
            return jsonify({'message': 'Invalid speech type'}), 400
        
        speech_doc = {
            'user_id': ObjectId(user_id),
            'text': text,
            'type': speech_type,
            'created_at': datetime.utcnow()
        }
        
        result = speeches_collection.insert_one(speech_doc)
        speech_doc['id'] = str(result.inserted_id)
        del speech_doc['_id']
        speech_doc['user_id'] = str(speech_doc['user_id'])
        
        return jsonify(speech_doc), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to save speech', 'error': str(e)}), 500

@app.route('/api/speeches', methods=['GET'])
@jwt_required()
def get_speeches():
    try:
        user_id = get_jwt_identity()
        
        speeches = list(speeches_collection.find(
            {'user_id': ObjectId(user_id)}
        ).sort('created_at', -1))
        
        for speech in speeches:
            speech['id'] = str(speech['_id'])
            del speech['_id']
            speech['user_id'] = str(speech['user_id'])
        
        return jsonify(speeches), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to get speeches', 'error': str(e)}), 500
@app.route('/api/compare', methods=['POST'])
@jwt_required()
def compare_speeches():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        comparison_text = data.get('comparison_text', '').strip()

        if not comparison_text:
            return jsonify({'message': 'Comparison text is required'}), 400

        # Get the most recent reference speech for the user
        reference_speech = speeches_collection.find_one(
            {'user_id': ObjectId(user_id), 'type': 'reference'},
            sort=[('created_at', -1)]  # Sort by created_at in descending order and get the first (most recent) one
        )

        if not reference_speech:
            return jsonify({'message': 'No reference speeches found'}), 404

        # Use only the most recent reference speech text
        reference_text = reference_speech['text']

        # Clean and tokenize texts
        reference_words = clean_text(reference_text)
        comparison_words = clean_text(comparison_text)

        # Convert to sets for comparison
        reference_set = set(reference_words)
        comparison_set = set(comparison_words)

        # Find present and missing words
        present_words = list(reference_set.intersection(comparison_set))
        missing_words = list(reference_set - comparison_set)

        # Calculate match percentage
        if reference_set:
            match_percentage = (len(present_words) / len(reference_set)) * 100
        else:
            match_percentage = 0

        result = {
            'present_words': sorted(present_words),
            'missing_words': sorted(missing_words),
            'total_reference_words': len(reference_set),
            'match_percentage': match_percentage
        }
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'message': 'Comparison failed', 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow()}), 200

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Make sure MongoDB is running on {mongo_uri}")
    app.run(debug=True, host='0.0.0.0', port=5000)
