// src/pages/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../services/firebase"; // Ensure path is correct
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { LogIn, Mail, Lock } from "lucide-react"; // Removed Google from import

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state for buttons

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect or perform action on successful login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect or perform action on successful login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 to-black p-6 relative overflow-hidden group"> {/* Darker, professional background */}
      {/* Background circles for aesthetic, now continuously moving and animating vividly on group hover */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700 opacity-5 rounded-full mix-blend-screen transition-all duration-1000 ease-out transform scale-100 group-hover:opacity-30 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-2xl animate-blob animate-float animation-delay-2000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-700 opacity-5 rounded-full mix-blend-screen transition-all duration-1000 ease-out transform scale-100 group-hover:opacity-30 group-hover:scale-125 group-hover:rotate-[-8deg] group-hover:shadow-2xl animate-blob animate-float animation-delay-4000"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-700 opacity-5 rounded-full mix-blend-screen transition-all duration-1000 ease-out transform scale-100 group-hover:opacity-30 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-2xl animate-blob animate-float animation-delay-0"></div> {/* Removed animation-delay-0 as it's default */}

      <div
        className="bg-gray-800 bg-opacity-70 backdrop-blur-lg rounded-3xl shadow-3xl p-8 w-full max-w-md border border-gray-700 transform transition-all duration-700 ease-in-out hover:scale-[1.03] hover:shadow-2xl hover:translate-y-[-5px] hover:rotate-1 animate-fade-in-up relative z-10"
      >
        <h2
          className="text-5xl font-extrabold mb-8 text-center text-white drop-shadow-lg animate-fade-in-down"
        >
          Admin Login
        </h2>
        {error && (
          <p className="text-red-400 mb-6 text-center font-semibold animate-shake drop-shadow-md">
            {error}
          </p>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="relative group"> {/* Added group for icon animations */}
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 pl-12 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ease-in-out"
              autoComplete="email"
            />
          </div>
          <div className="relative group"> {/* Added group for icon animations */}
            <Lock
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 pl-12 bg-gray-700 bg-opacity-70 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 ease-in-out"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center p-3 rounded-lg font-bold text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 hover:translate-y-[-2px] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </span>
            ) : (
              <>
                <LogIn size={22} className="mr-3 group-hover:animate-bounce-h" /> {/* Increased size, larger margin */}
                Login
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center justify-center gap-4 animate-fade-in">
          <hr className="flex-grow border-t border-gray-600 border-opacity-70" />
          <span className="text-gray-400 opacity-90 font-medium tracking-wide">OR</span>
          <hr className="flex-grow border-t border-gray-600 border-opacity-70" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center p-3 rounded-lg font-bold text-lg bg-gray-700 border border-gray-600 text-gray-200 shadow-md hover:shadow-lg transform hover:scale-105 hover:translate-y-[-2px] transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Please wait...
              </span>
            ) : (
              <>
                {/* Custom Google SVG Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                  className="mr-3 group-hover:animate-spin-once" // Increased margin
                >
                  <path
                    fill="#4285F4"
                    d="M24 9.5c3.54 0 6.68 1.2 9.13 3.58l6.83-6.83C34.84 2.7 29.76 0 24 0 14.64 0 6.43 6.32 3.08 15.22l7.93 6.17C12.97 14.08 18.97 9.5 24 9.5z"
                  />
                  <path
                    fill="#34A853"
                    d="M46.5 24c0-1.56-.14-3.06-.41-4.5H24v9h12.71c-.55 2.93-2.49 5.4-5.31 6.71l8.11 6.29c4.74-4.38 7.88-11 7.88-18.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.01 28.23c-.35-1.03-.55-2.12-.55-3.23s.2-2.2.55-3.23l-7.93-6.17C1.15 19.37 0 21.56 0 24s1.15 4.63 3.08 6.17l7.93-6.17z"
                  />
                  <path
                    fill="#EA4335"
                    d="M24 46.5c6.5 0 12.08-2.14 16.1-5.8l-8.11-6.29c-2.29 1.54-5.15 2.45-8 2.45-5.03 0-10.03-4.58-12.99-11.36L3.08 33.6C6.43 42.5 14.64 46.5 24 46.5z"
                  />
                </svg>
                Continue with Google
              </>
            )}
        </button>
      </div>
    </div>
  );
}
