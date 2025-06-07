// src/pages/Settings.jsx
import React from "react";
import { Paintbrush } from "lucide-react"; // Icon

export default function Settings({ setTheme, currentTheme }) {
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  return (
    <div className="animate-fadeIn">
      <h2
        className="text-4xl font-extrabold mb-8 text-center"
        style={{ color: "var(--color-text)" }}
      >
        Application Settings
      </h2>

      <div
        className="max-w-3xl mx-auto p-6 rounded-xl shadow-lg"
        style={{ backgroundColor: "var(--color-card-bg)", border: '1px solid var(--color-border)' }}
      >
        <h3
          className="text-2xl font-semibold mb-6 flex items-center"
          style={{ color: "var(--color-text)" }}
        >
          <Paintbrush size={24} className="mr-3" /> Theme Selection
        </h3>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={currentTheme === "light"}
              onChange={handleThemeChange}
              className="form-radio h-5 w-5"
              style={{ color: 'var(--color-primary)', accentColor: 'var(--color-primary)' }} // Tailwind 4 does not support accent-color directly
            />
            <span className="text-lg font-medium" style={{ color: "var(--color-text-soft)" }}>
              Light Theme
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={currentTheme === "dark"}
              onChange={handleThemeChange}
              className="form-radio h-5 w-5"
              style={{ color: 'var(--color-primary)', accentColor: 'var(--color-primary)' }}
            />
            <span className="text-lg font-medium" style={{ color: "var(--color-text-soft)" }}>
              Dark Theme
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="theme"
              value="oceanic"
              checked={currentTheme === "oceanic"}
              onChange={handleThemeChange}
              className="form-radio h-5 w-5"
              style={{ color: 'var(--color-primary)', accentColor: 'var(--color-primary)' }}
            />
            <span className="text-lg font-medium" style={{ color: "var(--color-text-soft)" }}>
              Oceanic Theme
            </span>
          </label>
        </div>

        {/* Add more settings options here if needed */}
        <div className="mt-8 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-xl font-medium" style={{ color: "var(--color-text)" }}>
            Other Settings (Coming Soon)
          </h3>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-soft)" }}>
            Future settings for notifications, data export, etc., can be added here.
          </p>
        </div>
      </div>
    </div>
  );
}