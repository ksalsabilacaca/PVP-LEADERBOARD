require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectMongo, connectZombieRushRedis } = require('./src/database/database');
const othergameRoutes = require('./src/routes/othergame.routes');
const zombierushRoutes = require('./src/routes/zombierush.routes');

const app = express();
const port = process.env.PORT || 3000;

// Enable cross-origin requests from your Vite frontend
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// Connect to MongoDB
connectMongo();

// Connect to Redis (ZombieRush, self-hosted)
connectZombieRushRedis();

// Routes
// Using different endpoints as required
app.use('/api/othergame/scores', othergameRoutes);
app.use('/api/zombierush', zombierushRoutes);

app.listen(port, () => {
  console.log(`Backend API running on port ${port}`);
});