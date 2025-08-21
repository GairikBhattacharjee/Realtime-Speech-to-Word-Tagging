import { Link } from "react-router-dom";
// import heroImage from "@/assets/hero-image.jpg";
import { Zap, Mic, ArrowRight } from "lucide-react";
import Spline from '@splinetool/react-spline';

const HomePage = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 overflow-hidden">
      {/* Background Image */}
      <div style={{ position: 'relative', left: '100px', width: '100%', maxWidth: '500px', height: '500px', overflow: 'visible' }}>
  <Spline scene="https://prod.spline.design/KiyW-PSokJJ8Utpv/scene.splinecode" />
</div>




      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-full">
            <Zap className="inline-block mr-2 h-4 w-4" />
            Powered by Advanced AI
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent leading-tight">
            Speak, Tag, Studio
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform speech into intelligent, tagged insights. Our Python-powered platform combines
            cutting-edge speech-to-text with advanced word tagging for content creators and researchers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/app">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <Mic className="inline-block mr-2 h-5 w-5" />
                Start Transcribing
                <ArrowRight className="inline-block ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">99.5%</div>
              <div className="text-gray-300">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-gray-300">Tag Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">2x</div>
              <div className="text-gray-300">Faster Processing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-green-500/10 rounded-full blur-xl animate-pulse"></div>
    </section>
  );
};

export default HomePage;
