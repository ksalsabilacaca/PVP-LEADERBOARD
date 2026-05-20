const express = require('express');
const router = express.Router();
const {
  recordMatch,
  getLeaderboardBest,
  getLeaderboardTotal,
  getPlayer
} = require('../controllers/zombierush.controller');

router.post('/match-result', recordMatch);
router.get('/leaderboard/best', getLeaderboardBest);
router.get('/leaderboard/total', getLeaderboardTotal);
router.get('/player/:uuid', getPlayer);

module.exports = router;
