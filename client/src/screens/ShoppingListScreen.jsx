import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

export default function ShoppingListScreen() {
  const { shoppingList = [], setShoppingList, customStores = ['Walmart','Costco'], setCustomStores } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [bulkStore, setBulkStore] = useState('Unassigned');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const stores = useMemo(() => {
    const s = customStores;
    if (Array.isArray(s)) return s;
    if (s instanceof Set) return Array.from(s);
    if (s && typeof s === 'object') return Object.values(s);
    if (typeof s === 'string') return s.split(',').map(x => x.trim()).filter(Boolean);
    return [];
  }, [customStores]);

  const grouped = useMemo(() => {
    const acc = { Unassigned: [] };
    for (const item of shoppingList) {
      const store = item.store || 'Unassigned';
      acc[store] = acc[store] || [];
      acc[store].push(item);
    }
    return acc;
  }, [shoppingList]);

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const applyBulk = () => {
    if (!bulkStore || selectedIds.size === 0) return;
    const next = shoppingList.map((i) => selectedIds.has(i.id) ? { ...i, store: bulkStore, isSorted: bulkStore !== 'Unassigned' } : i);
    setShoppingList?.(next);
    setSelectedIds(new Set());
    toast?.({ title: `Assigned ${bulkStore}`, variant: 'success' });
  };

  const removeItem = (id) => setShoppingList?.(shoppingList.filter(i => i.id !== id));

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <select className="border rounded-md px-2 py-1" value={bulkStore} onChange={(e)=>setBulkStore(e.target.value)}>
          <option value="Unassigned">Choose a store...</option>
          {stores.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="px-3 py-1 text-sm rounded-md border" onClick={applyBulk}>Apply to selected</button>
      </div>

      {Object.entries(grouped).map(([store, items]) => (
        <div key={store} className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{store}</h3>
          </div>
          <div className="bg-white rounded-lg border divide-y">
            {items.length === 0 && <div className="p-3 text-sm text-slate-500">No items.</div>}
            {items.map((i) => (
              <label key={i.id} className="flex items-center justify-between p-3 gap-3">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selectedIds.has(i.id)} onChange={()=>toggleSelect(i.id)} />
                  <span className="font-medium">{i.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded-md px-2 py-1 text-sm"
                    value={i.store || 'Unassigned'}
                    onChange={(e)=>{
                      const next = shoppingList.map(x => x.id === i.id ? { ...x, store: e.target.value, isSorted: e.target.value !== 'Unassigned' } : x);
                      setShoppingList?.(next);
                    }}
                  >
                    <option value="Unassigned">Unassigned</option>
                    {stores.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="text-xs px-2 py-1 rounded-md border" onClick={()=>removeItem(i.id)}>Remove</button>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
