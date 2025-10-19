const router = require('express').Router();
const User = require('../models/User');

// Use a test user ID from environment for development
const TEST_USER_ID = process.env.TEST_USER_ID;

// GET all pantry items for a user
// Route: GET /api/pantry
router.get('/', async (req, res) => {
  try {
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
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newItem = {
      name: req.body.name,
      quantity: req.body.quantity,
    };

    user.pantry.push(newItem);
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
    if (!TEST_USER_ID) {
      return res.status(500).json({ message: 'TEST_USER_ID not configured on server.' });
    }
    const user = await User.findById(TEST_USER_ID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find the item and pull it from the array
    user.pantry.pull({ _id: req.params.itemId });
    await user.save();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

module.exports = router;
