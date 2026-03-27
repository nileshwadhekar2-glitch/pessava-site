const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Not authorized' });
    }
  } else {
    res.status(401).json({ success: false, message: 'No token' });
  }
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, mobile, password });
    res.status(201).json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email },
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await user.matchPassword(password)) {
      res.json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET profile (protected)
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// UPDATE profile (protected)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.mobile) user.mobile = req.body.mobile;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADD address
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.address.push(req.body);
    await user.save();
    res.json({ success: true, message: 'Address added' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.protect = protect;