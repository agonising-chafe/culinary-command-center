import React, { useContext, useState } from 'react';
import { AppContext } from '@/context/AppContext';
import { useToast } from '@/components/ToastProvider';

export default function SettingsScreen() {
  const { customStores = [], setCustomStores } = useContext(AppContext);
  const { toast } = useToast?.() || { toast: () => {} };
  const [value, setValue] = useState('');

  const add = () => {
    const name = value.trim();
    if (!name) return;
    if (customStores.includes(name)) { toast?.({ title: 'Store already exists', variant: 'info' }); return; }
    const next = [...customStores, name];
    setCustomStores?.(next);
    setValue('');
    toast?.({ title: `Added ${name}`, variant: 'success' });
  };

  const remove = (name) => {
    setCustomStores?.(customStores.filter(s => s !== name));
    toast?.({ title: `Removed ${name}`, variant: 'info' });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Manage Stores</h2>
      <div className="flex items-center gap-2 mb-4">
        <input className="flex-1 border rounded-lg px-3 py-2" placeholder="Enter a store name..." value={value} onChange={(e)=>setValue(e.target.value)} />
        <button className="px-3 py-2 rounded-lg border" onClick={add}>Add Store</button>
      </div>
      <div className="space-y-2">
        {customStores.length === 0 && <p className="text-slate-500">No custom stores yet.</p>}
        {customStores.map((s) => (
          <div key={s} className="flex items-center justify-between p-3 rounded-lg border bg-white">
            <span className="font-medium">{s}</span>
            <button className="text-xs px-2 py-1 rounded-md border" onClick={()=>remove(s)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
