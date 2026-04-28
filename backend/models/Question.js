const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
  questionText: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  mediaUrl: { type: String },
  difficultyScore: { type: Number, default: 50 },
  stats: {
    timesAppeared: { type: Number, default: 0 },
    timesAnsweredCorrectly: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'draft', 'user_submitted'], default: 'active' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Question', questionSchema);
