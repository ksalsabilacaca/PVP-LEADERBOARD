const OthergameScore = require('../models/othergame.model');

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
    res.status(200).json({ message: 'Skor othergame berhasil disimpan.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menyimpan skor othergame ke database.' });
  }
};

const getScores = async (req, res) => {
  try {
    const topScores = await OthergameScore.find().sort({ score: -1 }).limit(100);
    const formattedScores = topScores.map((s) => ({ value: s.username, score: s.score }));
    res.status(200).json(formattedScores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil skor othergame dari database.' });
  }
};

module.exports = {
  saveScore,
  getScores
};