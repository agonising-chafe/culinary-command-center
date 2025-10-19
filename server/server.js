// server/server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const MOCK = String(process.env.MOCK_MODE).toLowerCase() === 'true';


const clientOrigin = process.env.CLIENT_URL;
app.use(cors({
  origin: clientOrigin || true, // reflect request origin in dev/mock
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

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

// Simple health endpoint for connectivity checks
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mock: MOCK });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
