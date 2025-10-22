const express = require('express');
const router = express.Router();
const { submitCandidate, getCandidates } = require('../controllers/candidateController');

router.post('/submit', submitCandidate);
router.get('/', getCandidates);

module.exports = router;