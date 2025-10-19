import React from 'react';

export default function SettingsScreen() {
  return (
    <section className="rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-300 p-6 space-y-6">
      <h1 className="text-xl font-semibold text-emerald-700 border-b border-emerald-100 pb-3">
        Settings
      </h1>
      <p className="text-slate-600">Configure your preferences and app settings here.</p>
    </section>
  );
}
