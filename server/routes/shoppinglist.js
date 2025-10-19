const router = require('express').Router();
const User = require('../models/User');
const MOCK = String(process.env.MOCK_MODE).toLowerCase() === 'true';
const mockPantry = [
  { _id: 'p1', name: 'onion', quantity: '2' },
  { _id: 'p2', name: 'garlic', quantity: '3 cloves' },
  { _id: 'p3', name: 'olive oil', quantity: '250 ml' },
];

// Use a test user ID from environment for development
const TEST_USER_ID = process.env.TEST_USER_ID;

/**
 * Helper function to consolidate ingredients.
 * Turns ["1 onion", "2 onions", "1 tbsp olive oil"]
 * into { onion: '3 units', 'olive oil': '1 tbsp' }
 * (This is a simplified version; a real app would use complex parsing)
 */
const consolidateIngredients = (recipes) => {
  const ingredientsMap = new Map();
  const ingredientsList = recipes.flatMap(recipe => recipe.ingredients);

  ingredientsList.forEach(ing => {
    // Basic consolidation: just use the ingredient name as a key for now.
    // A more advanced version would parse "1 onion" and "2 onions".
    const key = ing.toLowerCase();
    ingredientsMap.set(key, (ingredientsMap.get(key) || 0) + 1);
  });
  
  // For this version, we'll just return a simple list of unique ingredient names
  return Array.from(ingredientsMap.keys());
};

/**
 * Helper function to subtract pantry items.
 */
const subtractPantryItems = (required, pantry) => {
  const pantryNames = pantry.map(item => item.name.toLowerCase());
  return required.filter(item => !pantryNames.includes(item));
};

/**
 * Helper function to group items by category (simplified).
 * A real app would use a database or a comprehensive mapping.
 */
const groupItems = (items) => {
  const grouped = {
    Produce: [],
    Meat: [],
    Pantry: [],
    Miscellaneous: [],
  };

  items.forEach(item => {
    if (item.includes('chicken') || item.includes('beef') || item.includes('shrimp')) {
      grouped.Meat.push(item);
    } else if (item.includes('onion') || item.includes('garlic') || item.includes('lettuce') || item.includes('spinach')) {
      grouped.Produce.push(item);
    } else if (item.includes('oil') || item.includes('flour') || item.includes('salt') || item.includes('canned')) {
      grouped.Pantry.push(item);
    } else {
      grouped.Miscellaneous.push(item);
    }
  });

  // Convert to the format our front-end expects
  const finalList = {};
  for (const [category, items] of Object.entries(grouped)) {
    if (items.length > 0) {
      finalList[category] = items.map((name, index) => ({ id: `${category}-${index}`, name, quantity: '' }));
    }
  }
  return finalList;
};

// Return current shopping list (mock only; DB-backed not implemented)
router.get('/', async (req, res) => {
  try {
    if (MOCK) {
      return res.json([
        { id: 'i1', name: 'Milk', store: 'Unassigned', isSorted: false },
        { id: 'i2', name: 'Eggs', store: 'Unassigned', isSorted: false },
      ]);
    }
    // No persistence layer defined yet; return an empty list to satisfy client
    return res.json([]);
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- The Main Route ---
// Route: POST /api/shoppinglist/generate
router.post('/generate', async (req, res) => {
  try {
    if (!TEST_USER_ID && !MOCK) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const { recipes } = req.body; // Get recipes from the front-end
    if (!recipes) {
      return res.status(400).json({ message: 'No recipes provided.' });
    }

    // 1. Fetch the user's pantry
    let pantryData = mockPantry;
    if (!MOCK) {
      const user = await User.findById(TEST_USER_ID);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      pantryData = user.pantry;
    }
    
    // 2. Consolidate ingredients from all recipes
    const requiredItems = consolidateIngredients(recipes);

    // 3. Subtract items the user already has in their pantry
    const itemsToBuy = subtractPantryItems(requiredItems, pantryData);

    // 4. Group the remaining items by category
    const finalGroupedList = groupItems(itemsToBuy);

    // 5. Send the final, smart list back
    res.json(finalGroupedList);

  } catch (err) {
    console.error('Error generating shopping list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
