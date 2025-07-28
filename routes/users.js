const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.send("Signup successful");
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    res.send("Login successful");
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).send("Internal server error");
  }
});

/* GET users listing. */
router.get('/', function(_req, res) {
  res.send('respond with a resource');
});

module.exports = router;
