// backend/index.js
const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();

// ----------------- MongoDB -----------------
let cached = global.mongo;
if (!cached) cached = global.mongo = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
connectDB();

// ----------------- Model Candidate -----------------
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
const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', candidateSchema);

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ----------------- Routes -----------------

// GET all candidates
app.get('/api/users', async (req, res) => {
  try {
    const users = await Candidate.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST candidature
app.post('/api/submit-candidature', upload.fields([
  { name: 'photo-realisateur' },
  { name: 'photo-film' }
]), async (req, res) => {
  try {
    const { director, email, title, duration, country, category, synopsis, filmFile, pdf } = req.body;
    let photoRealisateur = req.files['photo-realisateur'] ? req.files['photo-realisateur'][0].buffer.toString('base64') : null;
    let photoFilm = req.files['photo-film'] ? req.files['photo-film'][0].buffer.toString('base64') : null;

    const candidate = new Candidate({
      director, email, title, duration, country, category, synopsis, filmFile, pdf, photoRealisateur, photoFilm
    });
    await candidate.save();
    res.json({ message: "Candidature enregistrée avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST send email
app.post('/api/send-email', async (req, res) => {
  const { email, name, pdf } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Festival Leonard De Vinci" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Votre candidature PDF - ${name}`,
      text: 'Voici votre candidature au format PDF.',
      attachments: [{
        filename: `${name}_Candidature.pdf`,
        content: Buffer.from(pdf, 'base64'),
        contentType: 'application/pdf'
      }]
    });

    res.json({ message: 'Email envoyé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’envoi de l’email' });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ----------------- Export serverless -----------------
module.exports = serverless(app);
