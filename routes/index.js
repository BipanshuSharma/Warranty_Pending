// routes/index.js

var express = require('express');
var router = express.Router();

/* GET home page (login form). */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login Page' });
});

/* POST login form */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Dummy login check
  if (email === "test@example.com" && password === "123456") {
    res.send("Login successful");
  } else {
    res.send("Invalid credentials");
  }
});

module.exports = router;
