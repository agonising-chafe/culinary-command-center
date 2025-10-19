import React, { useContext } from 'react';
import ToastControlsPopover from '@/components/ToastControlsPopover';
import { Link } from 'react-router-dom';
import { AppContext } from '@/context/AppContext';

export default function AppHeader() {
  const { setRecipes, setPantryItems, setMealPlan } = useContext(AppContext);

  return (
    <header className="w-full bg-white/70 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between text-[14px]">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-base sm:text-lg font-semibold truncate hover:text-emerald-600">
            Culinary Command Center
          </Link>
          <nav className="flex items-center gap-3 text-sm text-slate-600">
            <Link className="hover:text-emerald-600" to="/pantry">Pantry</Link>
            <Link className="hover:text-emerald-600" to="/shopping-list">Shopping</Link>
            <Link className="hover:text-emerald-600" to="/recipes">Recipes</Link>
            <Link className="hover:text-emerald-600" to="/settings">Settings</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ToastControlsPopover />
          <button
            className="text-xs px-2 py-1 rounded-md border"
            onClick={() => {
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
                const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
                return Array.from({ length: 7 }).map((_, i) => ({
                  day: days[i],
                  date: new Date(sow.getFullYear(), sow.getMonth(), sow.getDate() + i).toISOString(),
                  lunch: demoRecipes[0],
                  dinner: demoRecipes[1],
                  history: { lunch: [], dinner: [] }
                }));
              });
            }}
          >
            Seed demo
          </button>
        </div>
      </div>
    </header>
  );
}
