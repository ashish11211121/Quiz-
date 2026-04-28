const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String },
  iconUrl: { type: String },
  isActive: { type: Boolean, default: true },
  questionCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Category', categorySchema);
