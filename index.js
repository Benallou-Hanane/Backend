


const express = require('express');
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const Candidate = require('./models/Candidate');
const connectDB = require("./config/db");
const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route pour candidature
app.post('/submit-candidature', upload.fields([
  { name: 'photo-realisateur' },
  { name: 'photo-film' }
]), async (req, res) => {
  try {
    const { director, email, title, duration, country, category, synopsis, filmFile, pdf } = req.body;

    let photoRealisateur = req.files['photo-realisateur'] ? req.files['photo-realisateur'][0].buffer.toString('base64') : null;
    let photoFilm = req.files['photo-film'] ? req.files['photo-film'][0].buffer.toString('base64') : null;

    const candidate = new Candidate({
      director,
      email,
      title,
      duration,
      country,
      category,
      synopsis,
      filmFile,
      pdf,
      photoRealisateur,
      photoFilm
    });

    await candidate.save();
    res.json({ message: "Candidature enregistrée avec succès !" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route pour envoyer email
app.post('/send-email', async (req, res) => {
  const { email, name, pdf } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "hananebenallou27@gmail.com",
        pass: "typj mbex spwc xnhh"
      }
    });

    await transporter.sendMail({
      from: '"Festival Leonard De Vinci" <hananebenallou27@gmail.com>',
      to: email,
      subject: `Votre candidature PDF - ${name}`,
      text: 'Voici votre candidature au format PDF.',
      attachments: [
        {
          filename: `${name}_Candidature.pdf`,
          content: Buffer.from(pdf, 'base64'),
          contentType: 'application/pdf'
        }
      ]
    });

    res.json({ message: 'Email envoyé avec succès ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l’envoi de l’email ' });
  }
});

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);





// Start server
const PORT = process.env.PORT || 5000;
module.exports = app;
