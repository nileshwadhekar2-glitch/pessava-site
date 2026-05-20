const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded.id).select('-password').then(user => {
        req.user = user;
        next();
      });
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
    console.log('Register request body:', req.body);
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sab fields bharo — name, email, mobile, password' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Yeh email pehle se registered hai' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.isAdmin 
      },
      token: generateToken(user._id)
    });

  } catch (err) {
    console.log('Register error:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email aur password daalo' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ya password galat hai' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ya password galat hai' 
      });
    }

    res.json({
      success: true,
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        isAdmin: user.isAdmin 
      },
      token: generateToken(user._id)
    });

  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET profile
router.get('/profile', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// UPDATE profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.name) user.name = req.body.name;
    if (req.body.mobile) user.mobile = req.body.mobile;
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
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

// ADMIN - get all users
router.get('/all', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.protect = protect;