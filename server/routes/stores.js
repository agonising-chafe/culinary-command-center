const router = require('express').Router();
const User = require('../models/User');

// Hardcoded user ID for testing purposes
const TEST_USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID

// GET all stores for a user
// Route: GET /api/stores
router.get('/', async (req, res) => {
  try {
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
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newStore = {
      name: req.body.name,
    };

    user.stores.push(newStore);
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
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.stores.pull({ _id: req.params.storeId });
    await user.save();
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
