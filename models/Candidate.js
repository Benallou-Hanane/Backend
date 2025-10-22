
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  director: String,
  email: String,
  title: String,
  duration: String,
  country: String,
  category: String,
  synopsis: String,
  filmFile: String,
  pdf: String,
  photoRealisateur: String,
  photoFilm: String
});

module.exports = mongoose.model('Candidate', candidateSchema);
