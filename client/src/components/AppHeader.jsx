import React, { useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';

const baseButton =
  'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500/60';

function buttonClasses({ variant = 'neutral', disabled = false }) {
  if (disabled) {
    return [
      baseButton,
      'cursor-not-allowed border-slate-200 bg-white text-slate-400',
    ].join(' ');
  }
  if (variant === 'primary') {
    return [
      baseButton,
      'border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/60',
    ].join(' ');
  }
  return [
    baseButton,
    'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200',
  ].join(' ');
}

export default function AppHeader() {
  const navigate = useNavigate();
  const {
    setRecipes,
    setPantryItems,
    setMealPlan,
    mealPlan = [],
    shoppingList,
    shoppingListItems,
  } = useContext(AppContext);

  const shoppingItems = useMemo(() => {
    if (Array.isArray(shoppingList) && shoppingList.length) return shoppingList;
    if (Array.isArray(shoppingListItems)) return shoppingListItems;
    return [];
  }, [shoppingList, shoppingListItems]);

  const hasPlannedMeals = useMemo(
    () => Array.isArray(mealPlan) && mealPlan.some((day) => day?.lunch || day?.dinner),
    [mealPlan],
  );

  const clearPlan = () => {
    if (!hasPlannedMeals) return;
    const confirmed = window.confirm('Clear the current meal plan? This cannot be undone.');
    if (!confirmed) return;
    setMealPlan?.((prev) => {
      if (!Array.isArray(prev)) return prev;
      return prev.map((day) => ({ ...day, lunch: null, dinner: null }));
    });
  };

  const seedDemo = () => {
    const demoRecipes = [
      { id: 'r1', title: 'Garlic Lemon Chicken', cookTime: '25m', calories: '~520 kcal', image: '' },
      { id: 'r2', title: 'Veggie Pasta', cookTime: '20m', calories: '~480 kcal', image: '' },
    ];
    setRecipes?.(demoRecipes);
    setPantryItems?.([
      { id: '1', name: 'Olive Oil', qty: '16.9', unit: 'fl oz', currentQty: 16.9, expiryDate: '2026-12-01' },
      { id: '2', name: 'Onions', qty: '4', unit: 'large', currentQty: 4, expiryDate: '2025-12-31' },
    ]);
    setMealPlan?.(() => {
      const sow = new Date();
      sow.setDate(sow.getDate() - sow.getDay());
      sow.setHours(0, 0, 0, 0);
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      return Array.from({ length: 7 }).map((_, i) => ({
        day: days[i],
        date: new Date(sow.getFullYear(), sow.getMonth(), sow.getDate() + i).toISOString(),
        lunch: demoRecipes[0],
        dinner: demoRecipes[1],
        history: { lunch: [], dinner: [] },
      }));
    });
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-[14px] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="text-lg font-semibold text-slate-900 transition hover:text-emerald-600 sm:text-xl"
          >
            Culinary Command Center
          </Link>
          <button
            type="button"
            className={buttonClasses({ variant: 'primary' })}
            onClick={seedDemo}
          >
            Seed demo data
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={buttonClasses({ disabled: true })}
            disabled
            aria-disabled="true"
            title="Weekly recap is coming soon"
          >
            Review last week
          </button>
          <button
            type="button"
            className={buttonClasses({})}
            onClick={() => navigate('/pantry')}
          >
            My pantry
          </button>
          <button
            type="button"
            className={buttonClasses({})}
            onClick={() => navigate('/settings')}
          >
            Settings
          </button>
          <button
            type="button"
            className={buttonClasses({ disabled: !shoppingItems.length })}
            disabled={!shoppingItems.length}
            aria-disabled={!shoppingItems.length}
            onClick={() => {
              if (!shoppingItems.length) return;
              navigate('/shopping-list');
            }}
          >
            {shoppingItems.length ? 'View shopping list' : 'Generate shopping list'}
          </button>
          <button
            type="button"
            className={buttonClasses({ disabled: !hasPlannedMeals })}
            disabled={!hasPlannedMeals}
            aria-disabled={!hasPlannedMeals}
            onClick={clearPlan}
            title={hasPlannedMeals ? 'Clear current meal plan' : 'Add meals before clearing'}
          >
            <span className="sr-only">Clear plan</span>
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
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
