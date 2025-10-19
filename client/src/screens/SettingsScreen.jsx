import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

export default function SettingsScreen() {
  const { customStores = [], setCustomStores } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [value, setValue] = useState('');
  const [editingStore, setEditingStore] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const add = () => {
    const name = value.trim();
    if (!name) return;
    if (customStores.includes(name)) { toast?.({ title: 'Store already exists', variant: 'info' }); return; }
    const next = [...customStores, name];
    setCustomStores?.(next);
    setValue('');
    toast?.({ title: `Added ${name}`, variant: 'success' });
  };

  const remove = (name) => {
    setCustomStores?.(customStores.filter((s) => s !== name));
    toast?.({ title: `Removed ${name}`, variant: 'info' });
  };

  const startEditing = (name) => {
    setEditingStore(name);
    setEditingValue(name);
  };

  const saveEdit = () => {
    if (!editingStore) return;
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    if (customStores.includes(trimmed) && trimmed !== editingStore) {
      toast?.({ title: 'Store already exists', variant: 'info' });
      return;
    }
    const next = customStores.map((store) => (store === editingStore ? trimmed : store));
    setCustomStores?.(next);
    toast?.({ title: `Updated ${trimmed}`, variant: 'success' });
    setEditingStore(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingStore(null);
    setEditingValue('');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-2">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to planner
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage stores</h1>
            <p className="text-sm text-slate-500">Create shortcuts for the places you shop most.</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex w-full flex-col gap-2 sm:max-w-md">
            <span className="text-sm font-medium text-slate-700">Store name</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Enter a store name..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            onClick={add}
          >
            Add store
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Saved stores</h2>
        <div className="mt-4 space-y-3">
          {customStores.length === 0 && <p className="text-sm text-slate-500">No custom stores yet.</p>}
          {customStores.map((store) => {
            const isEditing = editingStore === store;
            return (
              <div
                key={store}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-inner sm:flex-row sm:items-center sm:justify-between"
              >
                {isEditing ? (
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                  />
                ) : (
                  <span className="font-medium text-slate-900">{store}</span>
                )}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-100"
                        onClick={saveEdit}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-600 transition hover:bg-slate-100"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-600 transition hover:bg-slate-100"
                        onClick={() => startEditing(store)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-red-600 transition hover:bg-red-100"
                        onClick={() => remove(store)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
