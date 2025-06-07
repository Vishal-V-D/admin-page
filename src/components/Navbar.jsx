// src/components/NavBar.jsx (if you use this component separately)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Ensure this path is correct

export default function NavBar() {
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    color: pathname === path ? 'var(--color-primary)' : 'var(--color-text-soft)',
    fontWeight: pathname === path ? 'bold' : 'normal',
    transition: 'color 0.2s ease-in-out',
    textDecoration: 'none',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
  });

  return (
    <nav
      className="flex gap-4 p-4 border-b"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-background)' }}
    >
      <Link to="/" style={linkStyle('/')} className="hover:text-primary transition-colors">Dashboard</Link>
      <Link to="/users" style={linkStyle('/users')} className="hover:text-primary transition-colors">Users</Link>
      <Link to="/logs" style={linkStyle('/logs')} className="hover:text-primary transition-colors">Logs</Link>
      <button
        onClick={() => signOut(auth)}
        className="ml-auto px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm"
        style={{ backgroundColor: 'var(--color-danger)', color: 'white' }}
      >
        Logout
      </button>
    </nav>
  );
}