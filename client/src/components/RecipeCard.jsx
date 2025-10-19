import React from 'react';

export default function RecipeCard({ image, title, cookTime, calories }) {
  return (
    <div className="recipe-card-clickable recipe-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border border-slate-200 h-full flex flex-col">
      <img src={image} alt={title} className="w-full h-24 object-cover" />
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-slate-800 flex-grow">{title}</h3>
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-500 gap-4">
          <span>🕒 {cookTime}</span>
          <span>🔥 {calories} kcal</span>
        </div>
      </div>
    </div>
  );
}
