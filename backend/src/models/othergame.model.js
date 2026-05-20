const mongoose = require('mongoose');

const othergameScoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    required: true
  }
});

const OthergameScore = mongoose.model('OthergameScore', othergameScoreSchema);

module.exports = OthergameScore;
