const { redisClient } = require('../database/database');
const realtime = require('../realtime');

const saveScore = async (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Requires username and score' });
  }

  try {
    // Upstash expects { score, member }
    await redisClient.zadd('leaderboard:minecraft', { score: score, member: username });
    realtime.broadcast('update', { game: 'minecraft' });
    res.status(200).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to write to database' });
  }
};

const getScores = async (req, res) => {
  try {
    // Upstash returns a flat array: ['user1', 100, 'user2', 90]
    const flatScores = await redisClient.zrange('leaderboard:minecraft', 0, 99, { rev: true, withScores: true });
    
    // Map flat array to [{ value: 'user', score: 100 }]
    const formattedScores = [];
    for (let i = 0; i < flatScores.length; i += 2) {
      formattedScores.push({ value: flatScores[i], score: flatScores[i + 1] });
    }

    res.status(200).json(formattedScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read from database' });
  }
};

module.exports = {
  saveScore,
  getScores
};