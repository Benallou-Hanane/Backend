const express = require('express');
const router = express.Router();
const { submitVote, getVotes } = require('../controllers/voteController');

router.post('/submit', submitVote);
router.get('/', getVotes);

module.exports = router;