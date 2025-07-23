var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

/* GET login page */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Login Page', 
    googleClientId: '917481300299-oqbkju4hsil10m6mi7v4tt6llpqg9q81.apps.googleusercontent.com' 
  });
});

/* GET signup page */
router.get('/signup', function(req, res, next) {
  res.render('signup', {
    googleClientId: process.env.GOOGLE_CLIENT_ID
  });
});


router.post('/signup', async function(req, res) {
  // We'll write full code later – just making sure this route exists
});




/* POST login form */
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "test@example.com" && password === "123456") {
    res.send("Login successful");
  } else {
    res.send("Invalid credentials");
  }
});

/* POST: Google login */
router.post("/google-login", (req, res) => {
  const { credential } = req.body;

  try {
    const decoded = jwt.decode(credential);
    const { email, name, picture } = decoded;

    // You can save this user info to your DB or session
    res.send(`Google login successful. Welcome, ${name} (${email})`);
  } catch (err) {
    res.status(401).send("Google login failed");
  }
});





module.exports = router;
