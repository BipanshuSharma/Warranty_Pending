const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // import the User model
require('dotenv').config();

/* GET login page */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Login Page',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });
});

/* GET signup page */
router.get('/signup', function (req, res, next) {
  res.render('signup', {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
  });
});

/* POST signup form */
router.post('/signup', async function (req, res) {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send('❌ User already exists with this email.');
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.send('✅ Signup successful!');
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).send('❌ Error during signup.');
  }
});

/* POST login form */
router.post('/login', (req, res) => {
  const { email, password } = req.body;


});

/* POST: Google login */
router.post('/google-login', (req, res) => {
  const { credential } = req.body;

  try {
    const decoded = jwt.decode(credential);
    const { email, name, picture } = decoded;

    // Save or verify user in DB later
    res.send(`✅ Google login successful. Welcome, ${name} (${email})`);
  } catch (err) {
    res.status(401).send('❌ Google login failed');
  }
});

module.exports = router;
