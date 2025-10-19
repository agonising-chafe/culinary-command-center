import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { recordFavorite } from '@/lib/tasteProfile';

export default function RecipeDetailModal({ recipe, open, onClose, onToggleFavorite }) {
  const { toast } = useToast?.() || { toast: () => {} };
  const overlayRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'Tab') trapFocus(e);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      // Focus first focusable element
      const first = panelRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      first?.focus();
    }
  }, [open]);

  const trapFocus = (e) => {
    const root = panelRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const list = Array.from(focusables);
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && active === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && active === last) { first.focus(); e.preventDefault(); }
  };

  if (!open) return null;
  const img = recipe?.image || '';

  const toggleFavorite = () => {
    try { recordFavorite(recipe); } catch {}
    onToggleFavorite?.(recipe);
    toast?.({ title: 'Added to favorites', variant: 'success' });
  };

  return (
    <div ref={overlayRef} onMouseDown={(e)=>{ if (e.target === overlayRef.current) onClose?.(); }} onKeyDown={(e) => e.key === 'Escape' && onClose?.()} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div ref={panelRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 overflow-hidden outline-none" role="dialog" aria-modal="true" tabIndex={-1}>
        <div className="relative">
          {img ? <img src={img} alt={recipe?.title || 'Recipe'} className="w-full h-64 object-cover" /> : <div className="w-full h-64 bg-slate-200" />}
          <button aria-label="Close" className="absolute top-3 right-3 rounded-full bg-white/80 p-2 hover:bg-white border" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <h3 className="text-2xl font-bold">{recipe?.title || recipe?.name}</h3>
            <button className="px-3 py-1.5 text-sm rounded-md border hover:bg-slate-50" onClick={toggleFavorite}>
              Favorite
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-2">Ingredients</h4>
              <ul className="list-disc list-inside text-slate-700 space-y-1">
                {(recipe?.ingredients || []).map((line, idx) => <li key={idx}>{line}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Instructions</h4>
              <ol className="list-decimal list-inside text-slate-700 space-y-1">
                {(recipe?.instructions || []).map((line, idx) => <li key={idx}>{line}</li>)}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
