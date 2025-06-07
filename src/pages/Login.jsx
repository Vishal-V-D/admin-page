// src/pages/Login.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "../services/firebase"; // Ensure path is correct
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { LogIn, Mail, Lock, Chrome } from "lucide-react"; // Changed 'Google' to 'Chrome'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 animate-fadeIn"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
      }}
    >
      <div
        className="rounded-lg shadow-2xl p-8 w-full max-w-md transform transition-transform duration-300 hover:scale-[1.01]"
        style={{ backgroundColor: "var(--color-card-bg)", color: "var(--color-text)" }}
      >
        <h2
          className="text-4xl font-extrabold mb-8 text-center"
          style={{ color: "var(--color-text)" }}
        >
          Admin Login
        </h2>
        {error && (
          <p className="text-danger mb-6 text-center font-medium animate-fadeIn" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
        )}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
              style={{
                borderColor: "var(--color-input-border)",
                backgroundColor: "var(--color-input-bg)",
                color: "var(--color-text)",
              }}
            />
            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-soft)" }}
            />
          </div>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 pl-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75"
              style={{
                borderColor: "var(--color-input-border)",
                backgroundColor: "var(--color-input-bg)",
                color: "var(--color-text)",
              }}
            />
            <Lock
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-soft)" }}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
            style={{ backgroundColor: "var(--color-primary)", color: "white" }}
          >
            <LogIn size={20} className="mr-2" />
            Login
          </button>
        </form>

        <div className="my-8 flex items-center justify-center gap-4 text-gray-400">
          <hr className="flex-grow border-t" style={{ borderColor: "var(--color-border)" }} />
          <span style={{ color: "var(--color-text-soft)" }}>OR</span>
          <hr className="flex-grow border-t" style={{ borderColor: "var(--color-border)" }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border rounded-lg py-3 font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
          style={{
            borderColor: "var(--color-input-border)",
            backgroundColor: "var(--color-input-bg)",
            color: "var(--color-text)",
          }}
        >
          <Chrome size={20} className="mr-2" /> {/* Changed to Chrome icon */}
          Continue with Google
        </button>
      </div>
    </div>
  );
}