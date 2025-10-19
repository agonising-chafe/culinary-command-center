# Culinary Command Center — shadcn/ui Upgrade Pack (Detailed)

This bundle modernizes your UI with shadcn components, adds quality-of-life features, and wires **Preferences** to actual behaviors. It also includes a scaffold for **AppContext**, providers, and routing.

---

## What’s Included

### UI/UX Upgrades
- **Shopping List**
  - Popover + Command **searchable store picker**
  - **Bulk assign** via Command palette
  - **Context menu** (right-click/long-press) with viewport clamping
  - **Toasts** for feedback
  - **Autosave OFF workflow**: pending queue + floating **Save / Discard** bar
  - **Compact mode** support (row padding shrinks when enabled)
  - **Haptics** gated by preference

- **Recipe Detail Modal**
  - shadcn **Dialog** (focus trap, Esc, outside-click)
  - **Command** filter for ingredients
  - **ScrollArea** for long lists
  - **Badges** for category/cookTime/calories
  - **Compact mode** tweaks (smaller title/badges)

- **Pantry**
  - shadcn **Table** experience
    - **Sorting** (Name, Qty, Unit, Expires, Category)
    - **Bulk select** (header checkbox)
    - **Bulk delete**
    - **Bulk “Add selected to Shopping List”**
  - **Low stock** banner
  - Add/Edit dialogs with **Command** suggestions and **auto-expiry** heuristics
  - **Compact mode** (smaller text/badges)

- **Settings**
  - shadcn **Tabs**: **Stores** and **Preferences**
  - **Stores**: Add / Rename (Dialog) / Delete (AlertDialog)
  - **Preferences**: Compact, Autosave, Haptics
  - **Toasts** on success/failure

### App Scaffolding (Canvas)
A ready-to-split scaffold is provided in canvas titled **“App Scaffolding: Context + Providers + Router + Toaster”** with:
- `AppContext` (global state: mealPlan, pantry, shopping list, stores, favorites, preferences)
- `AppProviders` wrapping with shadcn **Toaster**
- `App` with **react-router** + navbar
- Reference `main.jsx` boot

> Note: Scaffold is shown in the canvas (not in the ZIP). Copy to your `/src` and split into files as labeled.

---

## Files in ZIP
- `WeeklyPlannerScreen.jsx`
- `ShoppingListScreen.jsx`
- `PantryScreen.jsx`
- `SettingsScreen.jsx`
- `RecipeDetailModal.jsx`
- `README-shadcn-upgrade.md`
- (Your uploaded `*.css` files included as-is)

ZIP: `culinary-command-center-shadcn-updates.zip`

---

## Expected AppContext API

Context should export and manage:
```ts
{
  mealPlan, setMealPlan,                   // array of { name, lunch, dinner }
  shoppingListItems, setShoppingListItems, // list items with { id, name, store, inCart? }
  customStores, setCustomStores,           // [{ _id, name }]
  pantryItems, setPantryItems,             // [{ id, name, qty/currentQty, unit, expiryDate, category }]
  favoriteRecipeIds, setFavoriteRecipeIds, // Set of recipe ids
  preferences, setPreferences,             // { compact: boolean, autosave: boolean, haptics: boolean }
}
```
A compatible `AppContext` implementation is included in the scaffold in canvas.

---

## Preferences → Behavior Mapping

| Preference  | Location                           | Effects                                                                 |
|-------------|------------------------------------|-------------------------------------------------------------------------|
| `compact`   | Settings → Preferences             | Shrinks paddings/text in Shopping List, Pantry table, Planner, Modal   |
| `autosave`  | Settings → Preferences             | OFF shows Save/Discard bar and queues ops instead of calling API       |
| `haptics`   | Settings → Preferences             | Enables vibration on long-press/right-click (where supported)          |

---

## API Endpoints Used

Adjust to your backend routes as needed:

### Shopping List
- `PATCH /api/shoppinglist/:id` → assign/update store
- `PATCH /api/shoppinglist/bulk-assign` → bulk store assignment
- `POST  /api/cart/add` → move items to cart

### Pantry
- `GET    /api/pantry`
- `POST   /api/pantry`
- `PATCH  /api/pantry/:id`
- `DELETE /api/pantry/:id`
- `POST   /api/pantry/bulk-delete`
- `POST   /api/shoppinglist/from-pantry` → add selected pantry items to shopping list

### Favorites
- `POST   /api/favorites`
- `DELETE /api/favorites/:id`

> If your real endpoints differ, search for the paths above and edit.

---

## Install / Setup

```bash
# app deps
npm i react-router-dom axios lucide-react

# shadcn ui (if not installed)
# npx shadcn@latest init

# components used
# npx shadcn@latest add button card input popover command dropdown-menu dialog alert-dialog badge scroll-area table checkbox toast use-toast tabs label switch separator
```

Ensure Tailwind (or your CSS stack) is configured. Add shadcn’s `<Toaster />` once via `AppProviders`.

---

## Integration Steps

1) **Copy scaffold from canvas** into your `/src` tree:
   - `src/context/AppContext.jsx`
   - `src/AppProviders.jsx`
   - `src/App.jsx`
   - `src/main.jsx` (reference)

2) **Move screens** into `src/screens/` (or update import paths):
   - `WeeklyPlannerScreen.jsx`
   - `ShoppingListScreen.jsx`
   - `PantryScreen.jsx`
   - `SettingsScreen.jsx`
   - `RecipeBookScreen.jsx` (if you have it)

3) **Import aliases**  
   If you don’t use `@/components/ui/*`, search `@/components/ui/` and replace with your path.

4) **Wire API**  
   Update any endpoint paths to your backend. The UI is optimistic; server failures show toasts and revert where appropriate.

5) **Test preferences** under Settings:
   - Toggle **Compact** — verify tighter UI
   - Toggle **Autosave OFF** — make changes → see **Save/Discard** bar → Save and Discard both work
   - Toggle **Haptics** — long-press/right-click vibration only when enabled

---

## Migration Notes / Edge Cases

- **Autosave OFF**: Pending ops are queued in-memory; a hard refresh drops them. Save or Discard before navigating away if needed.
- **Meal plan shape**: planner uses an **array of days** (`[{ name, lunch, dinner }]`). When mapping from older object-shaped plans, convert once at load.
- **Ingredient images**: Recipe cards use category → image mapping or fallback placeholder; you can replace with your asset pipeline.
- **shadcn imports**: keep a single `<Toaster />` mounted in providers.

---

## Changelog Summary

- ✅ shadcn upgrades across Shopping List / Pantry / Recipe Detail / Settings
- ✅ Preferences panel (Compact, Autosave, Haptics)
- ✅ Autosave OFF Save/Discard workflow
- ✅ Pantry DataTable, sorting, bulk select, and bulk **Add to Shopping List**
- ✅ Planner compact spacing and smaller “Add meal” slot
- ✅ App scaffold (Context + Router + Toaster) delivered in canvas

If you want this README placed in `/docs/` or split into a CONTRIBUTING quickstart, say the word and I’ll generate those too.