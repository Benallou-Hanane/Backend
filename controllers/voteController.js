const Vote = require('../models/Vote');
const User = require('../models/User');

exports.submitVote = async (req, res) => {
  try {
    const { userName, userEmail, filmId, filmTitle } = req.body;

    // Check if user already voted
    const existingVote = await Vote.findOne({ userEmail });
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted'
      });
    }

    // Create or update user
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = new User({
        name: userName,
        email: userEmail,
        phone: req.body.phone || ''
      });
      await user.save();
    }

    // Create vote
    const vote = new Vote({
      userEmail,
      userName,
      filmId,
      filmTitle
    });

    await vote.save();

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      data: vote
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

exports.getVotes = async (req, res) => {
  try {
    const votes = await Vote.find().populate('user', 'name email');
    const voteCounts = await Vote.aggregate([
      {
        $group: {
          _id: '$filmId',
          count: { $sum: 1 },
          filmTitle: { $first: '$filmTitle' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        votes,
        voteCounts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};