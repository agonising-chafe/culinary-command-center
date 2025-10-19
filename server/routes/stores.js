const router = require('express').Router();
const User = require('../models/User');

// Mock mode toggle
const MOCK = String(process.env.MOCK_MODE).toLowerCase() === 'true';
const mockStores = [
  { _id: 's1', name: 'Walmart' },
  { _id: 's2', name: 'Costco' },
];

// Use a test user ID from environment for development
const TEST_USER_ID = process.env.TEST_USER_ID;

// GET all stores for a user
// Route: GET /api/stores
router.get('/', async (req, res) => {
  try {
    if (MOCK) {
      return res.json(mockStores);
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// POST a new store
// Route: POST /api/stores
router.post('/', async (req, res) => {
  try {
    const newStore = { _id: 's' + Date.now().toString(36), name: req.body.name };
    if (MOCK) {
      mockStores.push(newStore);
      return res.status(201).json(mockStores);
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.stores.push({ name: newStore.name });
    await user.save();
    res.status(201).json(user.stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

// DELETE a store
// Route: DELETE /api/stores/:storeId
router.delete('/:storeId', async (req, res) => {
  try {
    const id = req.params.storeId;
    if (MOCK) {
      const idx = mockStores.findIndex(s => String(s._id) === String(id));
      if (idx !== -1) mockStores.splice(idx, 1);
      return res.json({ message: 'Store deleted' });
    }
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.stores.pull({ _id: id });
    await user.save();
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
