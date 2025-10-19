import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

const commonIngredients = [
  'All-purpose flour',
  'Apples',
  'Avocado',
  'Baking powder',
  'Bananas',
  'Bell peppers',
  'Black beans',
  'Broccoli',
  'Brown rice',
  'Butter',
  'Carrots',
  'Cheddar cheese',
  'Chicken breast',
  'Cilantro',
  'Eggs',
  'Garlic',
  'Lemons',
  'Lettuce',
  'Milk',
  'Mushrooms',
  'Olive oil',
  'Onions',
  'Pasta',
  'Potatoes',
  'Salmon fillet',
  'Spinach',
  'Strawberries',
  'Tomatoes',
  'Yogurt',
];

const suggestedShelfLife = {
  apples: 30,
  avocado: 5,
  bananas: 4,
  'bell peppers': 10,
  carrots: 28,
  'chicken breast': 2,
  eggs: 28,
  garlic: 150,
  lemons: 21,
  lettuce: 7,
  milk: 7,
  mushrooms: 7,
  onions: 45,
  potatoes: 60,
  'salmon fillet': 2,
  spinach: 5,
  strawberries: 3,
  tomatoes: 10,
  yogurt: 14,
};

function normalizeName(name = '') {
  return name.toLowerCase().trim();
}

export default function PantryScreen() {
  const {
    pantryItems = [],
    setPantryItems,
    shoppingList,
    setShoppingList,
    shoppingListItems,
    setShoppingListItems,
  } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ name: '', qty: '', unit: '', expiry: '' });
  const [editingId, setEditingId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const listItems = useMemo(() => {
    if (Array.isArray(shoppingList)) return shoppingList;
    if (Array.isArray(shoppingListItems)) return shoppingListItems;
    return [];
  }, [shoppingList, shoppingListItems]);

  const setListItems = setShoppingList || setShoppingListItems;

  const arr = useMemo(() => {
    const p = pantryItems;
    if (Array.isArray(p)) return p;
    if (p && typeof p === 'object') return Object.values(p);
    return [];
  }, [pantryItems]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return arr;
    return arr.filter((i) => (i.name || '').toLowerCase().includes(query));
  }, [arr, q]);

  const addToList = (name) => {
    if (!name || !setListItems) return;
    const exists = listItems.some((i) => (i.name || '').toLowerCase() === String(name).toLowerCase());
    if (exists) {
      toast?.({ title: 'Already on your list', variant: 'info' });
      return;
    }
    const next = [
      ...listItems,
      { id: crypto.randomUUID?.() || String(Math.random()), name, store: 'Unassigned', isSorted: false },
    ];
    setListItems(next);
    toast?.({ title: `Added ${name} to shopping list`, variant: 'success' });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const resetForm = () => {
    setForm({ name: '', qty: '', unit: '', expiry: '' });
    setEditingId(null);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!setPantryItems) return;
    const name = form.name.trim();
    if (!name) return;
    const qty = form.qty.trim();
    const unit = form.unit.trim();
    const expiry = form.expiry;
    const parsedQty = Number.parseFloat(qty) || 0;

    const categorize = () => {
      const lower = name.toLowerCase();
      if (['apple', 'banana', 'berry', 'lettuce', 'spinach', 'tomato', 'onion'].some((s) => lower.includes(s))) return 'Produce';
      if (['chicken', 'beef', 'pork', 'salmon', 'fish'].some((s) => lower.includes(s))) return 'Meat & Seafood';
      if (['salt', 'pepper', 'cinnamon', 'paprika', 'spice'].some((s) => lower.includes(s))) return 'Spices';
      if (['milk', 'cheese', 'yogurt', 'butter'].some((s) => lower.includes(s))) return 'Dairy';
      return 'Pantry Staples';
    };

    setPantryItems((prev) => {
      const arrPrev = Array.isArray(prev) ? prev : [];
      if (editingId) {
        return arrPrev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name,
                qty,
                unit,
                expiryDate: expiry,
                currentQty: parsedQty || item.currentQty,
                initialQty: item.initialQty ?? parsedQty,
              }
            : item,
        );
      }
      const id = crypto.randomUUID?.() || `pantry-${Date.now()}`;
      return [
        ...arrPrev,
        {
          id,
          name,
          qty,
          unit,
          expiryDate: expiry,
          category: categorize(),
          currentQty: parsedQty || undefined,
          initialQty: parsedQty || undefined,
        },
      ];
    });
    toast?.({ title: editingId ? 'Pantry item updated' : `Added ${name}`, variant: 'success' });
    resetForm();
  };

  const beginEdit = (item) => {
    setEditingId(item.id);
    updateForm({
      name: item.name || '',
      qty: item.qty ? String(item.qty) : '',
      unit: item.unit || '',
      expiry: item.expiryDate || '',
    });
  };

  const deleteItem = (id) => {
    if (!setPantryItems) return;
    setPantryItems((prev) => (Array.isArray(prev) ? prev.filter((item) => item.id !== id) : prev));
    toast?.({ title: 'Removed from pantry', variant: 'info' });
    if (editingId === id) resetForm();
  };

  const suggestions = useMemo(() => {
    const value = form.name.trim().toLowerCase();
    if (!value) return [];
    return commonIngredients.filter((item) => item.toLowerCase().includes(value));
  }, [form.name]);

  const lowStockItems = useMemo(() => {
    return arr.filter((item) => {
      const current = Number.parseFloat(item.currentQty ?? item.qty ?? 0);
      const initial = Number.parseFloat(item.initialQty ?? item.qty ?? 0);
      if (!Number.isFinite(current) || !Number.isFinite(initial)) return false;
      if (initial === 0) return false;
      if (current <= 1) return true;
      return current <= initial * 0.25;
    });
  }, [arr]);

  const handleSuggestionSelect = (value) => {
    const normalized = normalizeName(value);
    const shelfDays = suggestedShelfLife[normalized];
    let expiry = form.expiry;
    if (shelfDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + shelfDays);
      expiry = expiryDate.toISOString().split('T')[0];
    }
    updateForm({ name: value, expiry });
    setShowSuggestions(false);
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
            <h1 className="text-2xl font-bold text-slate-900">My pantry</h1>
            <p className="text-sm text-slate-500">Search what you have on hand and keep an eye on what&apos;s expiring soon.</p>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Track pantry items</h2>
            <p className="text-sm text-slate-500">Log what you have on hand and keep tabs on expiration dates.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Item name
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="e.g., Onions"
                    value={form.name}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                      {suggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="block w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                          onClick={() => handleSuggestionSelect(item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Quantity
                <input
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="e.g., 4"
                  value={form.qty}
                  onChange={(e) => updateForm({ qty: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Unit
                <input
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="e.g., lbs"
                  value={form.unit}
                  onChange={(e) => updateForm({ unit: e.target.value })}
                />
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Expires
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={form.expiry}
                  onChange={(e) => updateForm({ expiry: e.target.value })}
                />
              </label>
            </div>
            <div className="flex items-end justify-end gap-2">
              {editingId && (
                <button
                  type="button"
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                {editingId ? 'Update item' : 'Add item'}
              </button>
            </div>
          </div>
        </form>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-700 sm:max-w-sm">
            Search pantry
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Find an ingredient..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="text-sm text-slate-500">{arr.length} item{arr.length === 1 ? '' : 's'} tracked</div>
        </div>

        {lowStockItems.length > 0 && (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
            <h3 className="text-base font-semibold text-amber-800">Low stock alerts</h3>
            <p className="text-xs text-amber-700">These ingredients are running low based on your quantities.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-amber-700">
                  <span>{item.name}</span>
                  <button
                    type="button"
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    onClick={() => addToList(item.name)}
                  >
                    Add to list
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {list.length === 0 && (
            <p className="text-sm text-slate-500">No pantry items yet. Add ingredients using the form above.</p>
          )}
          {Object.entries(
            list.reduce((acc, item) => {
              const cat = item.category || 'Pantry Staples';
              acc[cat] = acc[cat] || [];
              acc[cat].push(item);
              return acc;
            }, {}),
          ).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
              <div className="space-y-3">
                {items.map((item) => {
                  const expiry = item.expiryDate ? new Date(`${item.expiryDate}T00:00:00`) : null;
                  let badge = null;
                  if (expiry) {
                    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                    if (diff < 0) {
                      badge = (
                        <span className="rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                          Expired
                        </span>
                      );
                    } else if (diff <= 7) {
                      badge = (
                        <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          Expiring soon
                        </span>
                      );
                    } else {
                      badge = (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          Fresh
                        </span>
                      );
                    }
                  }
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-inner sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">
                          {(item.currentQty ?? item.qty ?? '—')}{item.unit ? ` ${item.unit}` : ''}
                        </div>
                        {badge}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                          onClick={() => beginEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          onClick={() => deleteItem(item.id)}
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                          onClick={() => addToList(item.name)}
                        >
                          Add to list
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
