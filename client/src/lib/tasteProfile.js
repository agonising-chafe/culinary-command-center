// src/lib/tasteProfile.js
const STORAGE_KEY = 'ccc.tasteProfile.v1';

const DEFAULT_PROFILE = {
  categories: {},
  ingredients: {},
  lastDecayAt: 0,
};

const clamp = (n, min = -10, max = 10) => Math.max(min, Math.min(max, n));
const normalizeKey = (s = '') => String(s).toLowerCase().trim();

export function loadTasteProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveTasteProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export function decay(profile, factor = 0.9) {
  const now = Date.now();
  if (profile.lastDecayAt && now - profile.lastDecayAt < 86_400_000) return profile;
  const next = { ...profile, categories: { ...profile.categories }, ingredients: { ...profile.ingredients }, lastDecayAt: now };
  for (const [k, v] of Object.entries(next.categories)) next.categories[k] = Math.abs(v) < 0.05 ? 0 : v * factor;
  for (const [k, v] of Object.entries(next.ingredients)) next.ingredients[k] = Math.abs(v) < 0.05 ? 0 : v * factor;
  saveTasteProfile(next);
  return next;
}

export function recordFeedback(recipe, { like = true, tags = [] } = {}) {
  const profile = decay(loadTasteProfile());
  const delta = like ? 1 : -1;

  const category = normalizeKey(recipe?.category || '');
  if (category) {
    const curr = profile.categories[category] || 0;
    profile.categories[category] = clamp(curr + delta);
  }

  const ings = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  for (const line of ings) {
    const key = normalizeKey(line).replace(/^[\d\s/.,-]+/,'').replace(/\([^)]*\)/g,'').replace(/[^a-z\s]/g,'').trim();
    if (!key) continue;
    const token = key.split(/\s+/)[0];
    const curr = profile.ingredients[token] || 0;
    profile.ingredients[token] = clamp(curr + delta * 0.5);
  }

  for (const t of tags) {
    const tag = normalizeKey(t).replace(/^#/,'');
    if (tag.includes('kid')) bumpCategory(profile, 'comfort', delta * 0.5);
    if (tag.includes('complicated')) bumpCategory(profile, 'quick', -Math.abs(delta));
    if (tag.includes('spicy')) bumpIngredient(profile, 'chili', delta * 0.5);
  }

  saveTasteProfile(profile);
  return profile;
}

function bumpCategory(profile, name, by) {
  const key = normalizeKey(name);
  const curr = profile.categories[key] || 0;
  profile.categories[key] = clamp(curr + by);
}

function bumpIngredient(profile, name, by) {
  const key = normalizeKey(name);
  const curr = profile.ingredients[key] || 0;
  profile.ingredients[key] = clamp(curr + by);
}

export function buildGenerationHints(maxEach = 5, threshold = 0.5) {
  const profile = decay(loadTasteProfile());

  const top = (obj, dir = 'desc') => Object.entries(obj)
    .filter(([_, w]) => (dir === 'desc' ? w > threshold : w < -threshold))
    .sort((a, b) => (dir === 'desc' ? b[1] - a[1] : a[1] - b[1]))
    .slice(0, maxEach)
    .map(([k]) => k);

  const preferredCategories = top(profile.categories, 'desc');
  const avoidCategories = top(profile.categories, 'asc');
  const preferredIngredients = top(profile.ingredients, 'desc');
  const avoidIngredients = top(profile.ingredients, 'asc');

  return { preferredCategories, avoidCategories, preferredIngredients, avoidIngredients };
}

export function attachTasteHints(payload) {
  try {
    const hints = buildGenerationHints();
    return { ...payload, taste: hints };
  } catch {
    return payload;
  }
}

export function recordFavorite(recipe) { return recordFeedback(recipe, { like: true }); }
export function recordDislike(recipe) { return recordFeedback(recipe, { like: false }); }
