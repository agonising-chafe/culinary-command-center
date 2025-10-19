import React, { useEffect, useRef, useState } from 'react';

const POSITIONS = [
  'top-right',
  'bottom-right',
  'top-center',
  'bottom-center',
  'top-left',
  'bottom-left',
];

export default function ToastControlsPopover() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(() => localStorage.getItem('ccc.toast.position') || 'bottom-right');
  const btnRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const dispatch = (detail) => window.dispatchEvent(new CustomEvent('ccc:toast-config', { detail }));

  const onChangePosition = (pos) => {
    setPosition(pos);
    dispatch({ key: 'position', value: pos });
  };

  const preview = () => dispatch({ key: 'preview' });

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-slate-50"
      >
        Toasts
      </button>

      {open && (
        <div ref={popRef} className="absolute right-0 mt-2 w-64 rounded-lg border bg-white shadow-md p-3 z-50">
          <div className="mb-2">
            <div className="text-sm font-medium mb-1">Position</div>
            <select
              className="w-full border rounded-md px-2 py-1 text-sm"
              value={position}
              onChange={(e) => onChangePosition(e.target.value)}
            >
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <button className="px-2.5 py-1.5 text-sm rounded-md border hover:bg-slate-50" onClick={preview}>
              Preview
            </button>
            <button className="px-2.5 py-1.5 text-sm rounded-md border hover:bg-slate-50" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
