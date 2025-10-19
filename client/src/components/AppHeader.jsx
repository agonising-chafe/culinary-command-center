import React from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="text-xl font-bold text-emerald-700 tracking-tight hover:text-emerald-800 transition-colors"
        >
          🍳 Culinary Command Center
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link className="hover:text-emerald-700 transition-colors" to="/pantry">Pantry</Link>
          <Link className="hover:text-emerald-700 transition-colors" to="/recipes">Recipes</Link>
          <Link className="hover:text-emerald-700 transition-colors" to="/shopping-list">Shopping List</Link>
          <Link className="hover:text-emerald-700 transition-colors" to="/settings">Settings</Link>
        </nav>
      </div>
    </header>
  );
}
