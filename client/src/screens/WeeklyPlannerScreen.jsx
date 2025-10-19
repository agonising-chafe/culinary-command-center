import React, { useContext, useEffect, useMemo, useState } from 'react';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';
import { attachTasteHints } from '@/lib/tasteProfile';

const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function startOfThisWeek() {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - today.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatMD(date) {
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${m[date.getMonth()]} ${date.getDate()}`;
}

const defaultPrompts = {
  lunch: 'Quick, healthy lunch for busy days',
  dinner: 'Comforting dinner with plenty of veggies',
};

export default function WeeklyPlannerScreen() {
  const { toast } = useToast?.() || { toast: () => {} };
  const { mealPlan = [], setMealPlan, pantryItems = [] } = useContext(AppContext);
  const [userGoals, setUserGoals] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [promptDialog, setPromptDialog] = useState({ open: false, dayIdx: null, type: null, mode: 'add' });
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => {
    if (!setMealPlan) return;
    if (!Array.isArray(mealPlan) || mealPlan.length !== 7) {
      const sow = startOfThisWeek();
      const initial = Array.from({ length: 7 }).map((_, i) => ({
        day: daysOfWeek[i],
        date: new Date(sow.getFullYear(), sow.getMonth(), sow.getDate() + i).toISOString(),
        lunch: null,
        dinner: null,
        history: { lunch: [], dinner: [] },
      }));
      setMealPlan(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pantryList = useMemo(() => {
    const p = pantryItems;
    return Array.isArray(p) ? p : (p && typeof p === 'object' ? Object.values(p) : []);
  }, [pantryItems]);

  const expiringSoon = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    return pantryList
      .filter((item) => item?.expiryDate)
      .filter((item) => {
        const d = new Date(`${item.expiryDate}T00:00:00`);
        return !Number.isNaN(d.getTime()) && d >= today && d <= end;
      })
      .map((item) => item.name);
  }, [pantryList]);

  const planDays = useMemo(() => (Array.isArray(mealPlan) ? mealPlan : []), [mealPlan]);

  const weekSummary = useMemo(() => {
    if (!planDays.length) return '';
    const first = new Date(planDays[0]?.date || startOfThisWeek());
    const last = new Date(planDays[planDays.length - 1]?.date || first);
    if (Number.isNaN(first.getTime()) || Number.isNaN(last.getTime())) return '';
    return `${formatMD(first)} – ${formatMD(last)}`;
  }, [planDays]);

  const openModal = (recipe) => {
    setSelectedRecipe(recipe);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelectedRecipe(null);
    setModalOpen(false);
  };

  const setSlot = (dayIdx, type, recipe) => {
    setMealPlan?.((prev) => {
      if (!Array.isArray(prev) || !prev[dayIdx]) return prev;
      const next = [...prev];
      next[dayIdx] = { ...next[dayIdx], [type]: recipe };
      return next;
    });
  };

  const pushHistory = (dayIdx, type, prompt) => {
    setMealPlan?.((prev) => {
      if (!Array.isArray(prev) || !prev[dayIdx]) return prev;
      const next = [...prev];
      const day = { ...next[dayIdx] };
      day.history = { ...day.history };
      const arr = Array.isArray(day.history[type]) ? [...day.history[type]] : [];
      if (prompt) arr.unshift(prompt);
      day.history[type] = arr.slice(0, 5);
      next[dayIdx] = day;
      return next;
    });
  };

  const onAddOrRegen = (dayIdx, type, promptStr) => {
    setGeneratingFor({ dayIdx, type });
    if (promptStr) pushHistory(dayIdx, type, promptStr);
    const recipe = fakeGenerateOne(promptStr || defaultPrompts[type], type);
    setSlot(dayIdx, type, recipe);
    setGeneratingFor(null);
    toast?.({ title: `${type === 'lunch' ? 'Lunch' : 'Dinner'} updated`, variant: 'success' });
  };

  const openPromptDialog = (dayIdx, type, mode) => {
    const history = planDays?.[dayIdx]?.history?.[type];
    const last = Array.isArray(history) && history.length > 0 ? history[0] : defaultPrompts[type];
    setPromptValue(last || defaultPrompts[type]);
    setPromptDialog({ open: true, dayIdx, type, mode });
  };

  const closePromptDialog = () => {
    setPromptDialog({ open: false, dayIdx: null, type: null, mode: 'add' });
    setPromptValue('');
  };

  const handleAdd = (dayIdx, type) => {
    openPromptDialog(dayIdx, type, 'add');
  };

  const handleRegenerate = (dayIdx, type) => {
    openPromptDialog(dayIdx, type, 'regenerate');
  };

  const confirmPrompt = () => {
    if (!promptDialog.open || !promptDialog.type || promptDialog.dayIdx == null) return;
    const trimmed = promptValue.trim();
    onAddOrRegen(promptDialog.dayIdx, promptDialog.type, trimmed);
    closePromptDialog();
  };

  const handleRemove = (dayIdx, type) => {
    setSlot(dayIdx, type, null);
    toast?.({ title: `${type === 'lunch' ? 'Lunch' : 'Dinner'} removed`, variant: 'info' });
  };

  const generateAll = async () => {
    if (!userGoals.trim()) return;
    try {
      setIsGeneratingPlan(true);
      const payload = attachTasteHints({ prompt: userGoals, expiring: expiringSoon });
      const data = fakeGenerate14(payload.prompt, payload.expiring || []);
      setMealPlan?.((prev) => {
        const base = Array.isArray(prev) && prev.length === 7
          ? [...prev]
          : Array.from({ length: 7 }).map((_, i) => ({
              day: daysOfWeek[i],
              date: new Date().toISOString(),
              lunch: null,
              dinner: null,
              history: { lunch: [], dinner: [] },
            }));
        for (let i = 0; i < 7; i += 1) {
          const day = base[i] || {};
          base[i] = {
            ...day,
            day: daysOfWeek[i],
            date: data[i]?.date || day.date || new Date().toISOString(),
            lunch: data[i] || null,
            dinner: data[i + 7] || null,
            history: day.history || { lunch: [], dinner: [] },
          };
        }
        return base;
      });
      toast?.({ title: 'Meal plan generated', variant: 'success' });
    } catch {
      toast?.({ title: 'Failed to generate plan', variant: 'error' });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const Skeleton = () => (
    <div className="flex h-36 w-full animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-100" />
  );

  const AddButton = ({ label, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="add-meal-btn flex h-36 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-3 text-slate-400 transition hover:border-slate-400 hover:bg-slate-100"
    >
      <span className="text-2xl leading-none">+</span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wide">{label}</span>
    </button>
  );

  const MealCard = ({ recipe, onOpen, onRegenerate, onDelete, label }) => {
    if (!recipe) return null;
    const hasImage = Boolean(recipe.image);
    return (
      <div className="group relative h-36">
        <button
          type="button"
          onClick={onOpen}
          className="recipe-card-clickable recipe-card flex h-full w-full overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative h-full w-24 flex-none bg-slate-100">
            {hasImage ? (
              <img src={recipe.image} alt={recipe.title || recipe.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {recipe.category || 'Recipe'}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{recipe.title || recipe.name}</h3>
            <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              <span className="flex items-center gap-1">
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {recipe.cookTime}
              </span>
              <span className="flex items-center gap-1">
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20s-6-4.35-6-10A6 6 0 0 1 12 4a6 6 0 0 1 6 6c0 5.65-6 10-6 10Z" />
                </svg>
                {recipe.calories}
              </span>
            </div>
          </div>
        </button>
        <div className="pointer-events-none absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={onRegenerate}
            className="pointer-events-auto rounded-full bg-white/80 p-1.5 text-slate-600 shadow-sm transition hover:bg-white"
          >
            <span className="sr-only">Regenerate {label}</span>
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 2v6h6" />
              <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
              <path d="M21 22v-6h-6" />
              <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="pointer-events-auto rounded-full bg-white/80 p-1.5 text-slate-600 shadow-sm transition hover:bg-white"
          >
            <span className="sr-only">Remove {label}</span>
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Plan your week</h1>
            <p className="text-sm text-slate-500">Describe what you&apos;re craving and let the planner sketch lunches and dinners that match.</p>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">What&apos;s the plan for this week?</span>
            <textarea
              id="goals"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g., Five healthy, high-protein dinners under 30 minutes. Or vegetarian lunches for two."
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {expiringSoon.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <span className="font-semibold">Expiring soon:</span>
                <div className="flex flex-wrap gap-2">
                  {expiringSoon.map((item) => (
                    <span key={item} className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={generateAll}
              disabled={!userGoals.trim() || isGeneratingPlan}
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${
                !userGoals.trim() || isGeneratingPlan
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                  : 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
              }`}
            >
              {isGeneratingPlan ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Generating…
                </span>
              ) : (
                'Generate meal plan'
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">This week&apos;s calendar</h2>
            {weekSummary && <p className="text-sm text-slate-500">{weekSummary}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          {planDays.map((day, dayIdx) => {
            const date = day?.date ? new Date(day.date) : null;
            const formatted = date && !Number.isNaN(date.getTime()) ? formatMD(date) : '';
            const lunchActive = generatingFor?.dayIdx === dayIdx && generatingFor?.type === 'lunch';
            const dinnerActive = generatingFor?.dayIdx === dayIdx && generatingFor?.type === 'dinner';
            return (
              <div key={day?.day || dayIdx} className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-center text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {day?.day || daysOfWeek[dayIdx]}
                  {formatted && <span className="ml-1 text-xs font-medium text-slate-400">{formatted}</span>}
                </h3>
                <div className="flex flex-1 flex-col gap-4">
                  {lunchActive ? (
                    <Skeleton />
                  ) : day?.lunch ? (
                    <MealCard
                      recipe={day.lunch}
                      label="lunch"
                      onOpen={() => openModal(day.lunch)}
                      onRegenerate={() => handleRegenerate(dayIdx, 'lunch')}
                      onDelete={() => handleRemove(dayIdx, 'lunch')}
                    />
                  ) : (
                    <AddButton label="Add lunch" onClick={() => handleAdd(dayIdx, 'lunch')} />
                  )}
                  {dinnerActive ? (
                    <Skeleton />
                  ) : day?.dinner ? (
                    <MealCard
                      recipe={day.dinner}
                      label="dinner"
                      onOpen={() => openModal(day.dinner)}
                      onRegenerate={() => handleRegenerate(dayIdx, 'dinner')}
                      onDelete={() => handleRemove(dayIdx, 'dinner')}
                    />
                  ) : (
                    <AddButton label="Add dinner" onClick={() => handleAdd(dayIdx, 'dinner')} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          open={modalOpen}
          onClose={closeModal}
          onToggleFavorite={() => {}}
        />
      )}

      {promptDialog.open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            role="presentation"
            onClick={closePromptDialog}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {promptDialog.mode === 'regenerate' ? 'Regenerate meal' : 'Add meal'}
                </h3>
                <p className="text-sm text-slate-500">
                  {daysOfWeek[promptDialog.dayIdx] || 'Day'} · {promptDialog.type === 'lunch' ? 'Lunch' : 'Dinner'}
                </p>
              </div>
              <textarea
                rows={4}
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g., Something quick and vegetarian."
              />
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wide">Recent prompts:</span>
                {(planDays?.[promptDialog.dayIdx]?.history?.[promptDialog.type] || [])
                  .slice(0, 3)
                  .map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-600"
                      onClick={() => setPromptValue(entry)}
                    >
                      {entry}
                    </button>
                  ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                onClick={closePromptDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/60 ${
                  !promptValue.trim()
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                }`}
                disabled={!promptValue.trim()}
                onClick={confirmPrompt}
              >
                {promptDialog.mode === 'regenerate' ? 'Regenerate' : 'Add meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Fake generators ---
function fakeGenerate14(prompt, expiring) {
  const goal = prompt || 'Chef-crafted meal';
  const extras = Array.isArray(expiring) && expiring.length ? ` with ${expiring[0]}` : '';
  const start = startOfThisWeek();
  const mk = (i, meal) => ({
    id: `${meal}-${i}`,
    title: `${meal} • ${goal.slice(0, 28)}${extras}`,
    cookTime: '25m',
    calories: '~500 kcal',
    image: '',
    category: meal,
    date: new Date(start.getFullYear(), start.getMonth(), start.getDate() + i).toISOString(),
  });
  return [
    ...Array.from({ length: 7 }).map((_, i) => mk(i, 'Lunch')),
    ...Array.from({ length: 7 }).map((_, i) => mk(i, 'Dinner')),
  ];
}

function fakeGenerateOne(prompt, type) {
  const goal = prompt || defaultPrompts[type];
  return {
    id: `${type}-${Math.random().toString(16).slice(2, 8)}`,
    title: `${type === 'lunch' ? 'Lunch' : 'Dinner'} • ${goal.slice(0, 40)}`,
    cookTime: '30m',
    calories: '~600 kcal',
    image: '',
    category: type,
  };
}
