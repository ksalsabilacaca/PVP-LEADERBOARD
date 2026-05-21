require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectPostgres, connectZombieRushRedis } = require('./src/database/database');
const othergameRoutes = require('./src/routes/othergame.routes');
const zombierushRoutes = require('./src/routes/zombierush.routes');
const generalRoutes = require('./src/routes/general.routes');
const { sseHandler } = require('./src/realtime');

const app = express();
const port = process.env.PORT || 3000;

// Enable cross-origin requests from your Vite frontend
app.use(cors());
// Parse incoming JSON payloads
app.use(express.json());

// Connect to PostgreSQL
connectPostgres();

// Connect to Redis (ZombieRush, self-hosted)
connectZombieRushRedis();

// Routes
// Using different endpoints as required
app.use('/api/othergame/scores', othergameRoutes);
app.use('/othergame/scores', othergameRoutes);
app.use('/api/zombierush', zombierushRoutes);
app.use('/zombierush', zombierushRoutes);
app.use('/api', generalRoutes);
app.use('/', generalRoutes);
app.get('/api/scores/live', sseHandler);
app.get('/scores/live', sseHandler);

app.listen(port, () => {
  console.log(`Backend API running on port ${port}`);
});