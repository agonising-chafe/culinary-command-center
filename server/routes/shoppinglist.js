const router = require('express').Router();
const User = require('../models/User');

// --- IMPORTANT ---
// Make sure this is the same hardcoded user ID from your pantry.js file!
const TEST_USER_ID = '64d1f2a3b5c6d7e8f9012345'; // <-- Replace with your actual MongoDB user ID

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

// --- The Main Route ---
// Route: POST /api/shoppinglist/generate
router.post('/generate', async (req, res) => {
  try {
    const { recipes } = req.body; // Get recipes from the front-end
    if (!recipes) {
      return res.status(400).json({ message: 'No recipes provided.' });
    }

    // 1. Fetch the user's pantry
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // 2. Consolidate ingredients from all recipes
    const requiredItems = consolidateIngredients(recipes);

    // 3. Subtract items the user already has in their pantry
    const itemsToBuy = subtractPantryItems(requiredItems, user.pantry);

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
