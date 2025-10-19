import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { useToast } from '@/components/ToastProvider';

export default function RecipeBookScreen() {
  const {
    recipes = [],
    favorites,
    setFavorites,
    favoriteRecipeIds,
    setFavoriteRecipeIds,
  } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };

  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const favoriteSet = useMemo(() => {
    if (favorites instanceof Set) return favorites;
    if (favoriteRecipeIds instanceof Set) return favoriteRecipeIds;
    if (Array.isArray(favoriteRecipeIds)) return new Set(favoriteRecipeIds);
    if (Array.isArray(favorites)) return new Set(favorites);
    return new Set();
  }, [favorites, favoriteRecipeIds]);

  const list = useMemo(() => {
    const arr = Array.isArray(recipes) ? recipes : [];
    const query = q.trim().toLowerCase();
    if (!query) return arr;
    return arr.filter((r) => (r.title || r.name || '').toLowerCase().includes(query));
  }, [recipes, q]);

  const toggleFavorite = (recipe) => {
    const recipeId = recipe?.id || recipe?.title || recipe?.name;
    if (!recipeId) return;

    if (setFavorites) {
      setFavorites((prev) => {
        const next = new Set(prev || []);
        if (next.has(recipeId)) {
          next.delete(recipeId);
          toast?.({ title: 'Removed from favorites', variant: 'info' });
        } else {
          next.add(recipeId);
          toast?.({ title: 'Added to favorites', variant: 'success' });
        }
        return next;
      });
      return;
    }

    if (setFavoriteRecipeIds) {
      setFavoriteRecipeIds((prev) => {
        const base = prev instanceof Set ? new Set(prev) : new Set(Array.isArray(prev) ? prev : []);
        if (base.has(recipeId)) {
          base.delete(recipeId);
          toast?.({ title: 'Removed from favorites', variant: 'info' });
        } else {
          base.add(recipeId);
          toast?.({ title: 'Added to favorites', variant: 'success' });
        }
        return base;
      });
    }
  };

  const isFavorite = (recipe) => favoriteSet.has(recipe?.id || recipe?.title || recipe?.name);

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
            <h1 className="text-2xl font-bold text-slate-900">Recipe book</h1>
            <p className="text-sm text-slate-500">Filter saved ideas or seed the demo to explore suggestions.</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {list.length} recipe{list.length === 1 ? '' : 's'} available
          </div>
          <label className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[240px]">
            <span className="text-sm font-medium text-slate-700">Search recipes</span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Search recipes..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 && <p className="text-sm text-slate-500">No recipes yet. Try seeding the demo to get started.</p>}
          {list.map((r) => (
            <div
              key={r.id || r.title}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative h-40 w-full bg-slate-100">
                {r.image ? (
                  <img src={r.image} alt={r.title || r.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="leading-snug" title={r.title || r.name}>
                  <span className="text-sm font-semibold text-slate-900">{r.title || r.name}</span>
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{r.cookTime} • {r.calories}</div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    onClick={() => { setSelected(r); setOpen(true); }}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium transition ${
                      isFavorite(r)
                        ? 'border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    onClick={() => toggleFavorite(r)}
                  >
                    {isFavorite(r) ? 'Favorited' : 'Favorite'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <RecipeDetailModal recipe={selected} open={open} onClose={() => setOpen(false)} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
