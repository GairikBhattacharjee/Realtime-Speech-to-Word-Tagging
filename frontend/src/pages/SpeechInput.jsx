import React from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Zap, Mic, ArrowRight } from "lucide-react";

class SpeechRecognitionApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      isRecording: false,
      recordingType: "reference",
      currentTranscript: "",
      speeches: [],
      comparisonResult: null,
      recognition: null,
      authMode: "login",
      authData: {
        username: "",
        email: "",
        password: "",
      },
      API_BASE: "http://localhost:5000/api",
    };
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token) {
      this.fetchUserProfile(token);
    }
    this.initializeSpeechRecognition();
  }

  initializeSpeechRecognition = () => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      toast.error("Speech recognition is not supported in your browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";
    recognitionInstance.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      this.setState({ currentTranscript: transcript });
    };
    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error(`Speech Recognition Error: ${event.error}`);
      this.setState({ isRecording: false });
    };
    this.setState({ recognition: recognitionInstance });
  };

  fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${this.state.API_BASE}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        this.setState({ user: userData });
        this.fetchSpeeches(token);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch profile.");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Network error occurred while fetching profile.");
      localStorage.removeItem("token");
    }
  };

  fetchSpeeches = async (token) => {
    try {
      const response = await fetch(`${this.state.API_BASE}/speeches`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const speechData = await response.json();
        this.setState({ speeches: speechData });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to fetch speeches.");
      }
    } catch (error) {
      console.error("Error fetching speeches:", error);
      toast.error("Network error occurred while fetching speeches.");
    }
  };

  handleAuth = async (e) => {
    e.preventDefault();
    const { authMode, authData, API_BASE } = this.state;
    try {
      const endpoint = authMode === "login" ? "login" : "register";
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        this.setState({ user: data.user });
        this.fetchSpeeches(data.token);
        toast.success(`${authMode === "login" ? "Logged in" : "Account created"} successfully`);
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error(`Network error occurred: ${error.message}`);
    }
  };

  handleLogout = () => {
    localStorage.removeItem("token");
    this.setState({
      user: null,
      speeches: [],
      comparisonResult: null,
    });
    toast.success("Logged out successfully");
  };

  startRecording = () => {
    const { recognition } = this.state;
    if (recognition) {
      this.setState({ currentTranscript: "", isRecording: true });
      recognition.start();
    }
  };

  stopRecording = () => {
    const { recognition } = this.state;
    if (recognition) {
      recognition.stop();
      this.setState({ isRecording: false });
    }
  };

  saveSpeech = async () => {
    const { currentTranscript, recordingType, speeches, API_BASE } = this.state;
    if (!currentTranscript.trim()) {
      toast.error("No speech to save");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/speeches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: currentTranscript,
          type: recordingType,
        }),
      });
      if (response.ok) {
        const newSpeech = await response.json();
        this.setState({
          speeches: [...speeches, newSpeech],
          currentTranscript: "",
        });
        toast.success("Speech saved successfully");
        if (recordingType === "comparison") {
          this.compareSpeeches(currentTranscript);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save speech");
      }
    } catch (error) {
      toast.error(`Network error occurred: ${error.message}`);
    }
  };

  compareSpeeches = async (comparisonText) => {
    const { API_BASE, currentTranscript } = this.state;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comparison_text: comparisonText || currentTranscript,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        this.setState({ comparisonResult: result });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Comparison failed");
      }
    } catch (error) {
      toast.error(`Network error occurred: ${error.message}`);
    }
  };

  toggleAuthMode = () => {
    this.setState((prevState) => ({
      authMode: prevState.authMode === "login" ? "signup" : "login",
    }));
  };

  render() {
    const {
      user,
      isRecording,
      recordingType,
      currentTranscript,
      speeches,
      comparisonResult,
      authMode,
      authData,
    } = this.state;

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 overflow-hidden">
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="max-w-md mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {authMode === "login" ? <span>🔑</span> : <span>👤</span>}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {authMode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="mt-2 text-gray-200">
                  {authMode === "login"
                    ? "Enter your credentials to access your account"
                    : "Create a new account to get started"}
                </p>
              </div>
              <form onSubmit={this.handleAuth} className="mt-6 space-y-4">
                {authMode === "signup" && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={authData.username}
                      onChange={(e) =>
                        this.setState({
                          authData: { ...authData, username: e.target.value },
                        })
                      }
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={authData.email}
                    onChange={(e) =>
                      this.setState({
                        authData: { ...authData, email: e.target.value },
                      })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={authData.password}
                    onChange={(e) =>
                      this.setState({
                        authData: { ...authData, password: e.target.value },
                      })
                    }
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {authMode === "login" ? "Login" : "Sign Up"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={this.toggleAuthMode} className="text-indigo-200 hover:text-white">
                  {authMode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Login"}
                </button>
              </div>
            </div>
          </div>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      );
    }

    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 overflow-hidden relative">
        <div className="relative container mt-2">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                Speech Recognition App
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{user.username}</span>
                </div>
                <button
                  onClick={this.handleLogout}
                  className="border border-gray-300 rounded-md px-4 py-2 bg-gradient-to-r from-yellow-400 to-pink-500 text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-yellow-400 to-pink-500 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-2">Speech Recording</h2>
                <p className="text-white mb-4">Record reference speech or comparison speech</p>
                <div className="mb-4">
                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => this.setState({ recordingType: "reference" })}
                      className={`px-4 py-2 rounded-md ${
                        recordingType === "reference"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Reference Speech
                    </button>
                    <button
                      onClick={() => this.setState({ recordingType: "comparison" })}
                      className={`px-4 py-2 rounded-md ${
                        recordingType === "comparison"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Comparison Speech
                    </button>
                  </div>
                  {recordingType === "reference" && (
                    <div className="p-4 mb-4 bg-blue-100 text-blue-800 rounded-md">
                      <p>Record your reference speech that will be stored and used for comparison.</p>
                    </div>
                  )}
                  {recordingType === "comparison" && (
                    <div className="p-4 mb-4 bg-blue-100 text-blue-800 rounded-md">
                      <p>Record speech to compare against your reference speeches.</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={
                      isRecording ? this.stopRecording : this.startRecording
                    }
                    className={`flex-1 px-4 py-2 rounded-md ${
                      isRecording
                        ? "bg-red-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                  {currentTranscript && (
                    <button
                      onClick={this.saveSpeech}
                      className="px-4 py-2 border rounded-md bg-gray-200"
                    >
                      Save Speech
                    </button>
                  )}
                </div>
                {currentTranscript && (
                  <div className="space-y-2 mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Current Transcript:
                    </label>
                    <textarea
                      value={currentTranscript}
                      onChange={(e) =>
                        this.setState({ currentTranscript: e.target.value })
                      }
                      placeholder="Your speech will appear here..."
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                )}
                {recordingType === "comparison" && currentTranscript && (
                  <button
                    onClick={() => this.compareSpeeches()}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Compare with Reference Speeches
                  </button>
                )}
              </div>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-2">Comparison Results</h2>
                <p className="text-white mb-4">
                  See which words match between your speeches
                </p>
                {comparisonResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {comparisonResult.match_percentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-white">Match Percentage</div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-green-600 font-medium">
                          Present Words:
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {comparisonResult.present_words.map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-red-600 font-medium">
                          Missing Words:
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {comparisonResult.missing_words.map((word, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-white">
                      Total reference words: {comparisonResult.total_reference_words}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-white py-8">
                    <p>Record a comparison speech to see results</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-indigo-500 rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold mb-2">Saved Speeches</h2>
              <p className="text-white mb-4">Your recorded speeches history</p>
              {speeches.length > 0 ? (
                <div className="space-y-4">
                  {speeches.map((speech) => (
                    <div key={speech.id} className="border rounded-lg p-4 bg-gradient-to-r from-red-500 to-orange-500">
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`px-2 py-1 rounded-md text-sm ${
                            speech.type === "reference"
                              ? " text-white"
                              : " text-white"
                          }`}
                        >
                          {speech.type === "reference" ? "Reference" : "Comparison"}
                        </span>
                        <span className="text-sm text-white">
                          {new Date(speech.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white">{speech.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white py-8">
                  <p>No speeches recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </section>
    );
  }
}

export default SpeechRecognitionApp;
