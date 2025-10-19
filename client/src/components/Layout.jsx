import React from 'react';
import AppHeader from './AppHeader';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <AppHeader />
      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
