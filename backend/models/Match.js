const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  mode: { type: String, enum: ['1v1', 'group', 'solo'], required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    placement: { type: Number },
    eloChange: { type: Number }
  }],
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  questionsUsed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
});

module.exports = mongoose.model('Match', matchSchema);
