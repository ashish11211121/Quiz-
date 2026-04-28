const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: 'default.png' },
  stats: {
    totalMatches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    highestStreak: { type: Number, default: 0 }
  },
  eloRating: { type: Number, default: 1200 },
  inventory: {
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    powerUps: {
      fiftyFifty: { type: Number, default: 0 },
      timeFreeze: { type: Number, default: 0 }
    },
    unlockedAvatars: [{ type: String }]
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
