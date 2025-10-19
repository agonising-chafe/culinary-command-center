const router = require('express').Router();
const Favorite = require('../models/Favorite');

// GET all favorite recipe IDs
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find().select('recipeId -_id');
    res.json(favorites.map(f => f.recipeId));
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ message: 'Failed to fetch favorites.' });
  }
});

// POST add a favorite
router.post('/', async (req, res) => {
  const { recipeId } = req.body;
  if (recipeId == null) {
    return res.status(400).json({ message: 'recipeId is required.' });
  }
  try {
    const fav = new Favorite({ recipeId });
    await fav.save();
    const updated = await Favorite.find().select('recipeId -_id');
    res.json(updated.map(f => f.recipeId));
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ message: 'Failed to add favorite.' });
  }
});

// DELETE remove a favorite
router.delete('/:id', async (req, res) => {
  const recipeId = parseInt(req.params.id, 10);
  try {
    await Favorite.deleteOne({ recipeId });
    const updated = await Favorite.find().select('recipeId -_id');
    res.json(updated.map(f => f.recipeId));
  } catch (err) {
    console.error('Error deleting favorite:', err);
    res.status(500).json({ message: 'Failed to delete favorite.' });
  }
});

module.exports = router;
