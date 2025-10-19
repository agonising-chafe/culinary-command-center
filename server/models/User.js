const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for a single item in the pantry
const pantryItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  // We can add a standardized ingredient ID later for the prediction feature
});

// Schema for a single custom store
const storeSchema = new Schema({
  name: { type: String, required: true, unique: true },
});

// Main User Schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pantry: [pantryItemSchema], // An array of pantry items
  stores: [storeSchema],      // An array of custom stores
}, {
  timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
});

const User = mongoose.model('User', userSchema);

module.exports = User;
