// src/App.jsx
import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import PostsPage from "./pages/PostsPage";
import UsersPage from "./pages/users";

import { auth } from "./services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Newspaper,
  LogOut,
  Moon,
  Sun,
  Palette,
} from "lucide-react";

export default function App() {
  /** ------------------------------------------------------------------
   *  1.  BASIC STATE
   * ------------------------------------------------------------------ */
  const [user, setUser]                 = useState(null);
  const [page, setPage]                 = useState("dashboard");
  const [theme, setTheme]               = useState("light");

  /* Drawer state:
     isOpen = true  ➜ fully visible (mobile) | expanded (desktop)
     isOpen = false ➜ hidden  (mobile)       | collapsed (desktop)
  */
  const [isOpen, setIsOpen]             = useState(window.innerWidth >= 768);
  const [isDesktop, setIsDesktop]       = useState(window.innerWidth >= 768);

  /** ------------------------------------------------------------------
   *  2.  RESPONSIVE LISTENER
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const handleResize = () => {
      const nowDesktop = window.innerWidth >= 768;
      setIsDesktop(nowDesktop);
      /* When switching breakpoint, fall back to “open” so it never disappears
         (feel free to tweak) */
      if (nowDesktop) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** ------------------------------------------------------------------
   *  3.  THEME
   * ------------------------------------------------------------------ */
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark", "oceanic");
    document.documentElement.classList.add(theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("app-theme");
    if (saved) setTheme(saved);
  }, []);

  /** ------------------------------------------------------------------
   *  4.  AUTH
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return unsub;
  }, []);

  if (!user) return <Login />;

  /** ------------------------------------------------------------------
   *  5.  SIDEBAR CLASS STRINGS
   * ------------------------------------------------------------------ */
  const sidebarBase =
    "flex flex-col shadow-xl z-30 transition-all duration-300 ease-in-out";

  /* On desktop: animate width; on mobile: animate translate-x */
  const sidebarDesktop   = isDesktop
    ? `${isOpen ? "w-64" : "w-20"}`
    : "";
  const sidebarMobile    = !isDesktop
    ? `${isOpen ? "translate-x-0" : "-translate-x-full"} fixed top-0 left-0 h-full w-64`
    : "";

  const sidebarClasses   = `${sidebarBase} ${sidebarDesktop} ${sidebarMobile}`
    .trim();

  /** ------------------------------------------------------------------
   *  6.  ICONS
   * ------------------------------------------------------------------ */
  const ToggleIcon = isDesktop
    ? isOpen ? ChevronLeft  : ChevronRight   // desktop collapse/expand
    : isOpen ? X            : Menu;          // mobile close/open

  /** ------------------------------------------------------------------
   *  7.  HELPERS
   * ------------------------------------------------------------------ */
  const toggleDrawer = () => setIsOpen((prev) => !prev);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch (err) { console.error(err); }
  };

  /** ------------------------------------------------------------------
   *  8.  RENDER
   * ------------------------------------------------------------------ */
  return (
    <div
      className="flex min-h-screen transition-colors duration-300"
      style={{ backgroundColor: "var(--color-background)", color: "var(--color-text)" }}
    >
      {/* =====  SIDEBAR  ===== */}
      <aside
        className={sidebarClasses}
        style={{ backgroundColor: "var(--color-sidebar-bg)" }}
      >
        {/* Top bar inside sidebar */}
        <div className="flex items-center justify-between h-16 px-4">
          {isOpen && isDesktop && (
            <h1
              className="text-2xl font-extrabold tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              Admin 
            </h1>
          )}
          <button
            onClick={toggleDrawer}
            className="p-2 rounded-full hover:bg-sidebar-hover"
            style={{ color: "var(--color-sidebar-text)" }}
            aria-label="Toggle sidebar"
          >
            <ToggleIcon size={24} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow mt-8 space-y-2">
          {[
            { name: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
            { name: "Users",     icon: UsersIcon,       path: "users" },
            { name: "Posts",     icon: Newspaper,       path: "posts" },
            { name: "Settings",  icon: SettingsIcon,    path: "settings" },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => setPage(item.path)}
              className={`flex items-center w-full px-4 py-3 rounded-lg text-lg font-medium
                transition-all duration-200
                ${
                  page === item.path
                    ? "bg-[var(--color-active-link-bg)] text-[var(--color-active-link-text)] shadow-md"
                    : "text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)]"
                }`}
            >
              <item.icon size={22} className={isOpen ? "mr-4" : ""} />
              {isOpen && item.name}
            </button>
          ))}
        </nav>

        {/* Sign-out */}
        <div className="mt-auto pt-6 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 rounded-lg font-medium
              bg-[var(--color-danger)] text-white hover:shadow-lg"
          >
            <LogOut size={22} className={isOpen ? "mr-4" : ""} />
            {isOpen && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* =====  MOBILE OVERLAY  ===== */}
      {!isDesktop && isOpen && (
        <div
          onClick={toggleDrawer}
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
        />
      )}

      {/* =====  MAIN  ===== */}
      <div className="flex-grow flex flex-col overflow-auto">
        {/* Header */}
        <header
          className="flex items-center justify-between h-16 px-6 shadow-md"
          style={{ backgroundColor: "var(--color-card-bg)", borderBottom: '1px solid var(--color-border)' }}
        >
          {/* Show menu button on mobile when sidebar CLOSED */}
          {!isDesktop && !isOpen && (
            <button
              onClick={toggleDrawer}
              className="p-2 rounded-full mr-4 hover:bg-sidebar-hover"
              style={{ color: "var(--color-sidebar-text)" }}
              aria-label="Open sidebar"
            >
              <Menu size={24} />
            </button>
          )}

          <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            {page.charAt(0).toUpperCase() + page.slice(1)}
          </h2>

          <div className="flex items-center space-x-4">
            <span
              className="font-medium hidden sm:block"
              style={{ color: "var(--color-text-soft)" }}
            >
              {user.email}
            </span>
            <button
              onClick={() =>
                setTheme((prev) =>
                  prev === "light" ? "dark" : prev === "dark" ? "oceanic" : "light"
                )
              }
              className="p-2 rounded-full hover:bg-sidebar-hover"
              style={{ color: "var(--color-text-soft)" }}
              aria-label="Change theme"
            >
              {theme === "light" && <Sun size={20} />}
              {theme === "dark" && <Moon size={20} />}
              {theme === "oceanic" && <Palette size={20} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-6 md:p-8 animate-fadeIn overflow-y-auto">
          {page === "dashboard" && <Dashboard />}
          {page === "users"     && <UsersPage />}
          {page === "posts"     && <PostsPage />}
          {page === "settings"  && <Settings setTheme={setTheme} currentTheme={theme} />}
        </main>
      </div>
    </div>
  );
}
