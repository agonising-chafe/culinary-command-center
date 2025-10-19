import React, { useContext, useEffect, useMemo, useState } from 'react';
import RecipeDetailModal from '@/components/RecipeDetailModal';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';
import { attachTasteHints } from '@/lib/tasteProfile';

const daysOfWeek = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

function startOfThisWeek() {
  const today = new Date();
  const d = new Date(today);
  d.setDate(today.getDate() - today.getDay());
  d.setHours(0,0,0,0);
  return d;
}

function formatMD(date) {
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${m[date.getMonth()]} ${date.getDate()}`;
}

export default function WeeklyPlannerScreen() {
  const { toast } = useToast?.() || { toast: () => {} };
  const { mealPlan = [], setMealPlan, pantryItems = [] } = useContext(AppContext);
  const [userGoals, setUserGoals] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [promptDraft, setPromptDraft] = useState('');

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
    const today = new Date(); today.setHours(0,0,0,0);
    const end = new Date(today); end.setDate(end.getDate() + 7);
    return pantryList
      .filter(i => i?.expiryDate)
      .filter(i => {
        const d = new Date(`${i.expiryDate}T00:00:00`);
        return d >= today && d <= end;
      })
      .map(i => i.name);
  }, [pantryList]);

  const openModal = (recipe) => { setSelectedRecipe(recipe); setModalOpen(true); };
  const closeModal = () => { setSelectedRecipe(null); setModalOpen(false); };

  const setSlot = (dayIdx, type, recipe) => {
    setMealPlan?.((prev) => {
      const next = [...prev];
      next[dayIdx] = { ...next[dayIdx], [type]: recipe };
      return next;
    });
  };

  const pushHistory = (dayIdx, type, prompt) => {
    setMealPlan?.((prev) => {
      const next = [...prev];
      const day = { ...next[dayIdx] };
      day.history = { ...day.history };
      const arr = [...(day.history[type] || [])];
      arr.unshift(prompt);
      day.history[type] = arr.slice(0,5);
      next[dayIdx] = day;
      return next;
    });
  };

  const generateAll = async () => {
    if (!userGoals.trim()) return;
    try {
      const payload = attachTasteHints({ prompt: userGoals, expiring: expiringSoon });
      const data = fakeGenerate14(userGoals, expiringSoon);
      setMealPlan?.((prev) => {
        const base = Array.isArray(prev) && prev.length === 7 ? [...prev] : Array.from({ length: 7 }).map((_, i) => ({
          day: daysOfWeek[i],
          date: data[i].date,
          lunch: null,
          dinner: null,
          history: { lunch: [], dinner: [] },
        }));
        for (let i = 0; i < 7; i++) {
          base[i] = { ...base[i], lunch: data[i], dinner: data[i+7] };
        }
        return base;
      });
      toast?.({ title: 'Meal plan generated', variant: 'success' });
    } catch {
      toast?.({ title: 'Failed to generate plan', variant: 'error' });
    }
  };

  const onAddOrRegen = (dayIdx, type, promptStr) => {
    setGeneratingFor({ dayIdx, type });
    pushHistory(dayIdx, type, promptStr);
    const recipe = fakeGenerateOne(promptStr, type);
    setSlot(dayIdx, type, recipe);
    setGeneratingFor(null);
    setPromptDraft('');
    toast?.({ title: `${type==='lunch'?'Lunch':'Dinner'} updated`, variant: 'success' });
  };

  const Skeleton = () => (
    <div className="animate-pulse border rounded-lg h-28 bg-slate-100" />
  );
  const AddButton = ({ label, onClick }) => (
    <button onClick={onClick} className="add-meal-btn border-2 border-dashed border-slate-300 rounded-lg h-36 flex flex-col items-center justify-center text-slate-400 p-2 hover:bg-slate-100 hover:border-slate-400 transition">
      <span className="text-lg">+</span>
      <span className="text-[11px] mt-1">{label}</span>
    </button>
  );

  return (
    <div className="w-full">
      <header className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-slate-200 gap-4 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Culinary Command Center</h1>
        {/* additional buttons if needed */}
      </header>
      <main className="flex flex-col gap-4">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto mb-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <label htmlFor="goals" className="block text-base font-semibold mb-2 min-w-0 truncate">What's the plan for this week?</label>
          <textarea id="goals" rows={3} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 min-w-0" placeholder="e.g., Five healthy, high-protein dinners under 30 minutes." value={userGoals} onChange={e=>setUserGoals(e.target.value)} />
          <div className="mt-3 flex items-center gap-2 justify-end">
            <button onClick={generateAll} disabled={!userGoals.trim()} className="px-4 py-2 text-sm bg-emerald-600 text-white font-semibold rounded-md disabled:opacity-50">
              Generate Meal Plan
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 items-start">
            {Array.isArray(mealPlan) && mealPlan.length === 7 && mealPlan.map((d, i) => (
              <div key={i} className="day-card min-w-0 h-full bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col gap-4">
                <h2 className="font-bold text-center text-slate-600 tracking-wider text-sm md:text-base min-w-0 truncate">
                  {d.day} <span className="text-xs font-medium text-slate-400">{formatMD(new Date(d.date))}</span>
                </h2>
                <div className="flex flex-col gap-3">
                  {generatingFor?.dayIdx===i&&generatingFor.type==='lunch'?<Skeleton/>:d.lunch?(
                    <div className="group relative">
                      <div role="button" tabIndex={0} onClick={()=>openModal(d.lunch)} onKeyDown={e=>e.key==='Enter'&&openModal(d.lunch)} className="cursor-pointer border rounded-lg overflow-hidden h-36 flex">
                        <img src={d.lunch.image||''} alt={d.lunch.title||'Lunch'} className="h-full w-24 object-cover flex-none"/>
                        <div className="p-3 flex flex-col min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 break-words min-w-0 truncate">
                            {d.lunch.title||d.lunch.name}
                          </h3>
                          <div className="mt-auto pt-2 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1">⏱ {d.lunch.cookTime}</span>
                            <span className="flex items-center gap-1">🔥 {d.lunch.calories}</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-700 hover:bg-white">↻</button>
                        <button className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-700 hover:bg-white">🗑</button>
                      </div>
                    </div>
                  ):(<AddButton label="Add Lunch" onClick={()=>onAddOrRegen(i,'lunch', prompt('Describe your lunch vibe', 'Quick healthy lunch')||'Quick healthy lunch')} />)}
                  {generatingFor?.dayIdx===i&&generatingFor.type==='dinner'?<Skeleton/>:d.dinner?(
                    <div className="group relative">
                      <div role="button" tabIndex={0} onClick={()=>openModal(d.dinner)} onKeyDown={e=>e.key==='Enter'&&openModal(d.dinner)} className="cursor-pointer border rounded-lg overflow-hidden h-36 flex">
                        <img src={d.dinner.image||''} alt={d.dinner.title||'Dinner'} className="h-full w-24 object-cover flex-none"/>
                        <div className="p-3 flex flex-col min-w-0 flex-1">
                          <h3 className="font-semibold text-sm text-slate-800 line-clamp-2 break-words min-w-0 truncate">
                            {d.dinner.title||d.dinner.name}
                          </h3>
                          <div className="mt-auto pt-2 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1">⏱ {d.dinner.cookTime}</span>
                            <span className="flex items-center gap-1">🔥 {d.dinner.calories}</span>
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-700 hover:bg-white">↻</button>
                        <button className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-700 hover:bg-white">🗑</button>
                      </div>
                    </div>
                  ):(<AddButton label="Add Dinner" onClick={()=>onAddOrRegen(i,'dinner', prompt('Describe your dinner vibe', 'Cozy healthy dinner')||'Cozy healthy dinner')} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      {selectedRecipe && <RecipeDetailModal recipe={selectedRecipe} open={modalOpen} onClose={closeModal} onToggleFavorite={()=>{}} />}
    </div>
  );
}

// --- Fake generators ---
function fakeGenerate14(prompt,expiring){
  const mk=(i,meal)=>({id:i, title:`${meal} • ${prompt.slice(0,24)}`, cookTime:'25m', calories:'~500 kcal', image:''});
  return [...Array(7).fill().map((_,i)=>mk(i,'Lunch')), ...Array(7).fill().map((_,i)=>mk(i,'Dinner'))];
}
function fakeGenerateOne(prompt,type){ return {id:1,title:`${type} • ${prompt}`,cookTime:'30m',calories:'~600 kcal',image:''}; }
