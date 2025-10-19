import React, { useEffect, useRef, useState } from 'react';
import { Heart, Maximize2, Minimize2, X } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import { recordFavorite } from '@/lib/tasteProfile';

export default function RecipeDetailModal({ recipe, open, onClose, onToggleFavorite }) {
  const { toast } = useToast?.() || { toast: () => {} };
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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

  useEffect(() => {
    if (!open) {
      setIsFullscreen(false);
      setIsFavorited(false);
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

  const safeIngredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const safeInstructions = Array.isArray(recipe?.instructions) ? recipe.instructions : [];

  if (!open) return null;
  const img = recipe?.image || '';
  const recipeTitle = recipe?.title || recipe?.name || 'Recipe';

  const toggleFavorite = () => {
    try { recordFavorite(recipe); } catch {}
    onToggleFavorite?.(recipe);
    setIsFavorited((prev) => !prev);
    toast?.({ title: isFavorited ? 'Removed from favorites' : 'Added to favorites', variant: 'success' });
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose?.();
      }}
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
    >
      <div
        ref={panelRef}
        className={`relative flex w-full flex-col overflow-hidden bg-white shadow-xl outline-none transition-all ${
          isFullscreen
            ? 'h-screen max-h-none max-w-none rounded-none'
            : 'm-4 max-h-[90vh] max-w-2xl rounded-2xl'
        }`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className="relative h-64 w-full flex-none bg-slate-200">
          {img ? (
            <img src={img} alt={recipeTitle} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold uppercase tracking-wide text-slate-500">
              {recipe?.category || 'Recipe'}
            </div>
          )}
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand'}
              className="rounded-full border border-white/70 bg-white/80 p-2 shadow-sm transition hover:bg-white"
              onClick={() => setIsFullscreen((prev) => !prev)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label={isFavorited ? 'Unfavorite' : 'Favorite'}
              className={`rounded-full border border-white/70 p-2 shadow-sm transition ${
                isFavorited ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-white/80 text-slate-600 hover:bg-white'
              }`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              aria-label="Close"
              className="rounded-full border border-white/70 bg-white/80 p-2 shadow-sm transition hover:bg-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{recipeTitle}</h3>
              <p className="text-sm text-slate-500">{recipe?.cookTime} · {recipe?.calories}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              onClick={toggleFavorite}
            >
              {isFavorited ? 'Favorited' : 'Add to favorites'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Ingredients</h4>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                {safeIngredients.length === 0 && <li>No ingredients provided.</li>}
                {safeIngredients.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Instructions</h4>
              <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-slate-700">
                {safeInstructions.length === 0 && <li>No instructions available.</li>}
                {safeInstructions.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
