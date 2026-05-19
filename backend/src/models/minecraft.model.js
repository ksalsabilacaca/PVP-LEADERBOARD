const mongoose = require('mongoose');

const minecraftScoreSchema = new mongoose.Schema({
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

const MinecraftScore = mongoose.model('MinecraftScore', minecraftScoreSchema);

module.exports = MinecraftScore;