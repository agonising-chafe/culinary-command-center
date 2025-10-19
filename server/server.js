// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
require('dotenv').config({ path: './server/.env' }); // Import dotenv with explicit path

console.log('Loaded environment variables:', process.env); // Debug log to verify all env vars

console.log('OpenAI API Key:', process.env.OPENAI_API_KEY); // Debug log to verify API key loading

const app = express();
const PORT = 5001;


app.use(cors());
app.use(express.json());

// --- Mongoose Connection ---
const mongoUri = process.env.MONGO_URI || 'your_default_mongo_connection_string_here';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));
// -------------------------

// --- API Routes ---
const pantryRoutes = require('./routes/pantry'); // 1. Import the new routes
app.use('/api/pantry', pantryRoutes);          // 2. Tell Express to use them

const mealplanRoutes = require('./routes/mealplan'); // Import mealplan routes
app.use('/api/mealplan', mealplanRoutes);            // Use mealplan routes

const shoppingListRoutes = require('./routes/shoppinglist'); // Import shopping list routes
app.use('/api/shoppinglist', shoppingListRoutes);            // Use shopping list routes

// Favorites routes
const favoriteRoutes = require('./routes/favorites');
app.use('/api/favorites', favoriteRoutes);

// Store routes
const storeRoutes = require('./routes/stores'); // Import store routes
app.use('/api/stores', storeRoutes);            // Use store routes

// Debug log to confirm shoppinglist route is loaded
console.log('Shopping list routes loaded');

// Added debug log to confirm shoppinglist route is loaded
console.log('Shopping list routes loaded');

app.get('/', (req, res) => {
  res.send('Hello from the Culinary Command Center API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
