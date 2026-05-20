const express = require('express');
const router = express.Router();
const { sseHandler } = require('../realtime');
const {
  getStats,
  getLeaderboard,
  getPlayers,
  getPlayerProfile,
  simulateMatch,
} = require('../controllers/general.controller');

router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.get('/players', getPlayers);
router.get('/player/:username', getPlayerProfile);
router.post('/simulate-match', simulateMatch);
router.get('/scores/live', sseHandler);

module.exports = router;
