const Candidate = require('../models/Candidate');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'photoRealisateur' || file.fieldname === 'photoFilm') {
      cb(null, 'uploads/photos/');
    } else {
      cb(null, 'uploads/films/');
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
}).fields([
  { name: 'photoRealisateur', maxCount: 1 },
  { name: 'photoFilm', maxCount: 1 }
]);

exports.submitCandidate = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: 'Error uploading files: ' + err.message 
      });
    }

    try {
      const {
        director,
        email,
        title,
        duration,
        country,
        category,
        synopsis,
        filmFile
      } = req.body;

      const candidate = new Candidate({
        director,
        email,
        photoRealisateur: req.files['photoRealisateur'] ? req.files['photoRealisateur'][0].filename : null,
        title,
        photoFilm: req.files['photoFilm'] ? req.files['photoFilm'][0].filename : null,
        duration,
        country,
        category,
        synopsis,
        filmFile
      });

      await candidate.save();

      res.status(201).json({
        success: true,
        message: 'Candidate submitted successfully',
        data: candidate
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error: ' + error.message
      });
    }
  });
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({ status: 'approved' });
    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};