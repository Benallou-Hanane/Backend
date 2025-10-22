const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  filmId: {
    type: String,
    required: true
  },
  filmTitle: {
    type: String,
    required: true
  },
  voteDate: {
    type: Date,
    default: Date.now
  }
});

// Ensure one vote per email
voteSchema.index({ userEmail: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);