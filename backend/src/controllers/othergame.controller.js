const { performance } = require('node:perf_hooks');
const OthergameScore = require('../models/othergame.model');
const realtime = require('../realtime');

const saveScore = async (req, res) => {
  const { username, score } = req.body;

  if (!username || typeof score !== 'number') {
    return res.status(400).json({ error: 'Memerlukan username dan score (number).' });
  }

  try {
    await OthergameScore.findOneAndUpdate(
      { username },
      { score },
      { upsert: true, new: true }
    );
    realtime.broadcast('update', { game: 'roblox' });
    res.status(200).json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan skor othergame ke database.' });
  }
};

const getScores = async (req, res) => {
  try {
    const totalStart = performance.now();
    const queryStart = performance.now();
    const topScores = await OthergameScore.find().sort({ score: -1 }).limit(100);
    const queryEnd = performance.now();
    const processStart = performance.now();
    const formattedScores = topScores.map((s) => ({
      value: s.username,
      username: s.username,
      playerName: s.username,
      score: s.score
    }));
    const processEnd = performance.now();

    res.status(200).json({
      data: formattedScores,
      metrics: {
        queryMs: Number((queryEnd - queryStart).toFixed(2)),
        processMs: Number((processEnd - processStart).toFixed(2)),
        totalMs: Number((processEnd - totalStart).toFixed(2)),
        source: 'MongoDB'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil skor othergame dari database.' });
  }
};

module.exports = {
  saveScore,
  getScores
};