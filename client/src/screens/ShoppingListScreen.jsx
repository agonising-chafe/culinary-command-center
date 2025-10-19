import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

export default function ShoppingListScreen() {
  const {
    shoppingList,
    setShoppingList,
    shoppingListItems,
    setShoppingListItems,
    customStores = ['Walmart', 'Costco'],
  } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [bulkStore, setBulkStore] = useState('Unassigned');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const listItems = useMemo(() => {
    if (Array.isArray(shoppingList)) return shoppingList;
    if (Array.isArray(shoppingListItems)) return shoppingListItems;
    return [];
  }, [shoppingList, shoppingListItems]);

  const setListItems = setShoppingList || setShoppingListItems;

  const stores = useMemo(() => {
    const s = customStores;
    if (Array.isArray(s)) return s;
    if (s instanceof Set) return Array.from(s);
    if (s && typeof s === 'object') return Object.values(s);
    if (typeof s === 'string') return s.split(',').map((x) => x.trim()).filter(Boolean);
    return [];
  }, [customStores]);

  const itemsToSort = useMemo(
    () =>
      listItems.filter((item) => {
        if (!item) return false;
        const store = item.store || 'Unassigned';
        return store === 'Unassigned' || item.isSorted === false;
      }),
    [listItems],
  );

  const groupedByStore = useMemo(() => {
    const acc = new Map();
    for (const item of listItems) {
      const store = item.store || 'Unassigned';
      if (store === 'Unassigned' || item.isSorted === false) continue;
      if (!acc.has(store)) acc.set(store, []);
      acc.get(store).push(item);
    }
    return acc;
  }, [listItems]);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const applyBulk = () => {
    if (!setListItems || !bulkStore || selectedIds.size === 0) return;
    const next = listItems.map((i) => (selectedIds.has(i.id)
      ? { ...i, store: bulkStore, isSorted: bulkStore !== 'Unassigned' }
      : i));
    setListItems(next);
    setSelectedIds(new Set());
    toast?.({ title: `Assigned ${bulkStore}`, variant: 'success' });
  };

  const removeItem = (id) => {
    if (!setListItems) return;
    setListItems(listItems.filter((i) => i.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const selectAllToSort = (checked) => {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    const next = new Set(selectedIds);
    itemsToSort.forEach((item) => next.add(item.id));
    setSelectedIds(next);
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
            <h1 className="text-2xl font-bold text-slate-900">Shopping list</h1>
            <p className="text-sm text-slate-500">Assign items to stores and prep for your next grocery run.</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span className="whitespace-nowrap">Assign selected to</span>
              <select
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={bulkStore}
                onChange={(e) => setBulkStore(e.target.value)}
              >
                <option value="Unassigned">Choose a store...</option>
                {stores.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              onClick={applyBulk}
            >
              Apply to selected
            </button>
          </div>
          <div className="text-sm text-slate-500">
            {listItems.length} item{listItems.length === 1 ? '' : 's'} total
          </div>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-amber-800">Items to sort</h2>
              <p className="text-xs text-amber-500">Assign each ingredient to one of your store lists.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={itemsToSort.length > 0 && itemsToSort.every((i) => selectedIds.has(i.id))}
                onChange={(e) => selectAllToSort(e.target.checked)}
              />
              Select all
            </label>
          </div>
          <div className="divide-y divide-slate-200">
            {itemsToSort.length === 0 && (
              <div className="px-4 py-6 text-sm text-slate-500 sm:px-6">All caught up! No loose items.</div>
            )}
            {itemsToSort.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <label className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                  {item.name}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-600 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    value={item.store || 'Unassigned'}
                    onChange={(e) => {
                      if (!setListItems) return;
                      const value = e.target.value;
                      const next = listItems.map((x) =>
                        x.id === item.id ? { ...x, store: value, isSorted: value !== 'Unassigned' } : x,
                      );
                      setListItems(next);
                      setSelectedIds((prev) => {
                        const updated = new Set(prev);
                        updated.delete(item.id);
                        return updated;
                      });
                    }}
                  >
                    <option value="Unassigned">Choose store...</option>
                    {stores.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:px-6">
              <span>{selectedIds.size} item{selectedIds.size === 1 ? '' : 's'} selected</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-100"
                onClick={applyBulk}
              >
                Assign to {bulkStore === 'Unassigned' ? '...' : bulkStore}
              </button>
            </div>
          )}
        </section>

        {Array.from(groupedByStore.entries()).map(([store, items]) => (
          <section key={store} className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{store}</h3>
                <p className="text-xs text-slate-400">{items.length} item{items.length === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:inline-flex"
                onClick={() => toast?.({ title: 'Print coming soon', variant: 'info' })}
              >
                Print list
              </button>
            </div>
            <div className="space-y-2 px-4 py-4 sm:px-6">
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner transition hover:border-emerald-200"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="flex-1 font-medium text-slate-800">{item.name}</span>
                  <button
                    type="button"
                    className="hidden items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:inline-flex"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
