
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // import the User model
const Warranty = require('../models/warranty'); // or your correct model path
const session = require('express-session');

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
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("❌ User not found.");
    }

    // If you're using plain text passwords (not recommended)
    if (user.password !== password) {
      return res.status(401).send("❌ Incorrect password.");
    }
     req.session.user = user;

    // ✅ Redirect to main page
    res.redirect('/main');
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send("❌ Error during login.");
  }
});

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

router.get('/main', async (req, res) => {
  const user = req.session.user;
  if (!user) return res.redirect('/');

  try {
    const warranties = await Warranty.find(); // fetch all warranties

    const today = new Date();
    const expiringSoon = warranties.filter(w => {
      const daysLeft = (new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30;
    });

    res.render('main', { user, warranties, expiringSoon });
  } catch (err) {
    console.error("Error fetching warranties:", err);
    res.status(500).send("Something went wrong");
  }
});



router.post('/add-warranty', async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { productName, purchaseDate, warrantyPeriod } = req.body;

  try {
    const newWarranty = new Warranty({
      user: req.session.user._id, // store reference to the user
      productName,
      purchaseDate,
      warrantyPeriod,
    });

    await newWarranty.save();
    res.redirect("/main"); // after adding, redirect back
  } catch (err) {
    console.error("Error adding warranty:", err);
    res.status(500).send("Something went wrong");
  }
});



module.exports = router;
