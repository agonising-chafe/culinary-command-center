const router = require('express').Router();
const User = require('../models/User');

// Mock mode toggle
const MOCK = String(process.env.MOCK_MODE).toLowerCase() === 'true';
// Simple in-memory mock state (process lifetime only)
const mockPantry = [
  { _id: 'p1', name: 'onion', quantity: '2' },
  { _id: 'p2', name: 'garlic', quantity: '3 cloves' },
  { _id: 'p3', name: 'olive oil', quantity: '250 ml' },
];

// Use a test user ID from environment for development
const TEST_USER_ID = process.env.TEST_USER_ID;

// GET all pantry items for a user
// Route: GET /api/pantry
router.get('/', async (req, res) => {
  try {
    if (MOCK) {
      return res.json(mockPantry);
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.pantry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST a new item to the pantry
// Route: POST /api/pantry
router.post('/', async (req, res) => {
  try {
    const newItem = {
      _id: 'p' + Date.now().toString(36),
      name: req.body.name,
      quantity: req.body.quantity,
    };
    if (MOCK) {
      mockPantry.push(newItem);
      return res.status(201).json(mockPantry);
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.pantry.push({ name: newItem.name, quantity: newItem.quantity });
    await user.save();
    res.status(201).json(user.pantry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE an item from the pantry
// Route: DELETE /api/pantry/:itemId
router.delete('/:itemId', async (req, res) => {
  try {
    const id = req.params.itemId;
    if (MOCK) {
      const idx = mockPantry.findIndex(i => String(i._id) === String(id));
      if (idx !== -1) mockPantry.splice(idx, 1);
      return res.json({ message: 'Item deleted' });
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.pantry.pull({ _id: id });
    await user.save();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
