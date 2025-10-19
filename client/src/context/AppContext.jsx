import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AppContext = createContext(null)

const OFFLINE = String(import.meta.env?.VITE_OFFLINE).toLowerCase() === 'true'

const LS = {
  pantry: 'pantry',
  mealPlan: 'mealPlan',
  shopping: 'shopping',
  stores: 'stores',
  favorites: 'favorites',
  recipes: 'recipes',
}

const coerceArray = (v, fallback = []) => {
  if (Array.isArray(v)) return v
  if (v && typeof v === 'object') return Object.values(v)
  return fallback
}

const safeParse = (k, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(k))
    return v ?? fallback
  } catch {
    return fallback
  }
}

const coerceStringArray = (v) => {
  if (Array.isArray(v)) return v
  if (v instanceof Set) return Array.from(v)
  if (v && typeof v === 'object') return Object.values(v)
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

export function AppProvider({ children }) {
  const [mealPlan, setMealPlan] = useState(() => coerceArray(safeParse(LS.mealPlan, [])))
  const [pantryItems, setPantryItems] = useState(() => coerceArray(safeParse(LS.pantry, [])))
  const [shoppingListItems, setShoppingListItems] = useState(() => coerceArray(safeParse(LS.shopping, [])))
  const [customStores, setCustomStores] = useState(() => coerceStringArray(safeParse('ccc.customStores.v1', ['Walmart', 'Costco'])))
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState(() => new Set(safeParse(LS.favorites, [])))
  const [recipes, setRecipes] = useState(() => coerceArray(safeParse(LS.recipes, [])))

  // Persist pantryItems to localStorage with migration
  useEffect(() => {
    const normalized = coerceArray(pantryItems)
    try {
      localStorage.setItem(LS.pantry, JSON.stringify(normalized))
    } catch {}
    if (normalized.length !== pantryItems.length) {
      setPantryItems(normalized)
    }
  }, [pantryItems])

  useEffect(() => {
    try {
      localStorage.setItem('ccc.customStores.v1', JSON.stringify(customStores))
    } catch {}
  }, [customStores])

  // Load initial data from the backend
  useEffect(() => {
    async function fetchData() {
      if ( OFFLINE ) {
        // Skip network calls; rely on localStorage defaults
        return
      }
      try {
        const [listRes, storesRes, favRes] = await Promise.all([
          axios.get('/api/shoppinglist'),
          axios.get('/api/stores'),
          axios.get('/api/favorites')
        ])
        setShoppingListItems(listRes.data)
        setCustomStores(storesRes.data)
        setFavoriteRecipeIds(new Set(favRes.data))
      } catch (err) {
        console.error('Error loading initial data', err)
      }
    }
    fetchData()
  }, [])

  return (
    <AppContext.Provider value={{
      mealPlan,
      setMealPlan,
      pantryItems,
      setPantryItems,
      shoppingListItems,
      setShoppingListItems,
      customStores,
      setCustomStores,
      favoriteRecipeIds,
      setFavoriteRecipeIds,
      recipes,
      setRecipes
    }}>
      {children}
    </AppContext.Provider>
  )
}
