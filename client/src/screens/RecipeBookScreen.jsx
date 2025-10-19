import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { useToast } from '@/components/ToastProvider';

export default function RecipeBookScreen() {
  const { recipes = [], favorites = new Set(), setFavorites } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };

  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const arr = Array.isArray(recipes) ? recipes : [];
    const query = q.trim().toLowerCase();
    if (!query) return arr;
    return arr.filter(r => (r.title || r.name || '').toLowerCase().includes(query));
  }, [recipes, q]);

  const toggleFavorite = (recipe) => {
    setFavorites?.((prev) => {
      const next = new Set(prev || []);
      const id = recipe?.id || (recipe?.title || recipe?.name);
      if (next.has(id)) {
        next.delete(id);
        toast?.({ title: 'Removed from favorites', variant: 'info' });
      } else {
        next.add(id);
        toast?.({ title: 'Added to favorites', variant: 'success' });
      }
      return next;
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Search recipes..." value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((r) => (
          <div key={r.id || r.title} className="border rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="relative">
              <img src={r.image || ''} alt={r.title || r.name} className="w-full h-40 object-cover bg-slate-100" />
            </div>
            <div className="p-3">
              <div className="font-semibold truncate">{r.title || r.name}</div>
              <div className="text-xs text-slate-500">{r.cookTime} • {r.calories}</div>
              <div className="mt-2 flex items-center justify-between">
                <button className="text-xs px-2 py-1 rounded-md border" onClick={()=>{ setSelected(r); setOpen(true); }}>View</button>
                <button className="text-xs px-2 py-1 rounded-md border" onClick={()=>toggleFavorite(r)}>
                  {favorites?.has(r.id || r.title) ? 'Unfavorite' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RecipeDetailModal recipe={selected} open={open} onClose={()=>setOpen(false)} onToggleFavorite={toggleFavorite} />
    </div>
  );
}
