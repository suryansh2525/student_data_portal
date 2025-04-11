const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', {
    expiresIn: '30d'
  });
};


const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Register request:', { username, password });

    // Check if user exists
    const userExists = await User.findOne({ username });
    console.log('User exists check:', userExists);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('Creating user...');
    const user = await User.create({ username, password });
    console.log('User created:', user);

    if (user) {
      console.log('Generating token for user:', user._id);
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id)
      });
    } else {
      console.log('User creation failed, no user object');
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for user
    const user = await User.findOne({ username });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser
};