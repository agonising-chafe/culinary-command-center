const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  recipeId: {
    type: Number,
    required: true,
    unique: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
