import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

export default function PantryScreen() {
  const { pantryItems = [], setPantryItems, shoppingList = [], setShoppingList } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [q, setQ] = useState('');

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
    if (!name) return;
    const exists = (shoppingList || []).some((i) => (i.name || '').toLowerCase() == String(name).toLowerCase());
    if (exists) { toast?.({ title: 'Already on your list', variant: 'info' }); return; }
    const next = [...(shoppingList || []), { id: crypto.randomUUID?.() || String(Math.random()), name, store: 'Unassigned', isSorted: false }];
    setShoppingList?.(next);
    toast?.({ title: `Added ${name} to shopping list`, variant: 'success' });
  };

  const today = new Date(); today.setHours(0,0,0,0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Search pantry..." value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-slate-500">No pantry items yet.</p>}
        {list.map((item) => {
          const expiry = item.expiryDate ? new Date(`${item.expiryDate}T00:00:00`) : null;
          let badge = null;
          if (expiry) {
            const diff = Math.ceil((expiry - today)/(1000*60*60*24));
            if (diff < 0) badge = <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Expired</span>;
            else if (diff <= 7) badge = <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Expiring</span>;
            else badge = <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">Fresh</span>;
          }
          return (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
              <div className="flex items-center gap-3">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.currentQty ?? item.qty} {item.unit}</div>
                </div>
                {badge}
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs px-2 py-1 rounded-md border" onClick={()=>addToList(item.name)}>Add to List</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
