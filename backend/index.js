require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectRedis, connectMongo } = require('./src/database/database');
const minecraftRoutes = require('./src/routes/minecraft.routes');
const othergameRoutes = require('./src/routes/othergame.routes');

const app = express();
const port = 3000;

// Enable cross-origin requests from your Vite frontend
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// Connect to Redis
connectRedis();

// Connect to MongoDB
connectMongo();

// Routes
// Using different endpoints as required
app.use('/api/minecraft/scores', minecraftRoutes);
app.use('/api/othergame/scores', othergameRoutes);

app.listen(port, () => {
  console.log(`Backend API running on port ${port}`);
});