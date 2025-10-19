import React from 'react';
import AppHeader from './AppHeader';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800">
      <AppHeader />
      <main className="w-full flex-1 px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-none space-y-10">{children}</div>
      </main>
    </div>
  );
}
