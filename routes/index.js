
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // import the User model
const Warranty = require('../models/warranty'); // or your correct model path
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

require('dotenv').config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory ensured at:', uploadsDir);
} catch (e) {
  console.error('Failed to create uploads directory:', e);
}

// Multer storage config: save files under public/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

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

    // Set session after successful signup
    req.session.user = newUser;

    // Redirect to main page
    res.redirect('/main');

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
    
    // Debug: Log what we're storing in session
    console.log("=== LOGIN DEBUG ===");
    console.log("User found:", user);
    console.log("User ID:", user._id);
    console.log("User ID type:", typeof user._id);
    
    req.session.user = user;
    console.log("Session user after setting:", req.session.user);

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

    // Debug: Log warranty data to understand the structure
    console.log('Warranties found:', warranties.length);
    warranties.forEach((w, index) => {
      console.log(`Warranty ${index + 1}:`, {
        product: w.product,
        purchaseDate: w.purchaseDate,
        purchaseDateType: typeof w.purchaseDate,
        expiryDate: w.expiryDate,
        expiryDateType: typeof w.expiryDate
      });
    });

    const today = new Date();
    const expiringSoon = warranties.filter(w => {
      if (!w.expiryDate) return false;
      const daysLeft = (new Date(w.expiryDate) - today) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30;
    });

    res.render('main', { user, warranties, expiringSoon });
  } catch (err) {
    console.error("Error fetching warranties:", err);
    res.status(500).send("Something went wrong");
  }
});



router.post('/add-warranty', upload.single('billImage'), async (req, res) => {
  console.log("=== ADD WARRANTY DEBUG ===");
  console.log("Session user:", req.session.user);
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  
  if (!req.session.user) {
    console.log("No user in session, redirecting to login");
    return res.redirect("/");
  }

  const {
    product,
    brand,
    description,
    purchaseDate,
    warrantyPeriod,
  } = req.body;

  console.log("Form data received:", {
    product,
    brand,
    description,
    purchaseDate,
    warrantyPeriod
  });

  
  
  
  // Validate required fields
  if (!product || !brand || !purchaseDate || !warrantyPeriod) {
    console.log("Missing required fields");
    return res.status(400).send("Missing required fields");
  }
  
  // Convert purchaseDate string to proper Date object
  const purchaseDateObj = new Date(purchaseDate);
  
  // Validate date
  if (isNaN(purchaseDateObj.getTime())) {
    console.log("Invalid purchase date:", purchaseDate);
    return res.status(400).send("Invalid purchase date");
  }
  
  // Calculate expiry date by adding warranty period months
  const expiryDate = new Date(purchaseDateObj);
  expiryDate.setMonth(expiryDate.getMonth() + parseInt(warrantyPeriod));
  
  console.log("Calculated dates:", {
    purchaseDateObj,
    expiryDate,
    warrantyPeriod: parseInt(warrantyPeriod)
  });
  
  try {
    const newWarranty = new Warranty({
      user: req.session.user._id, // store reference to the user
      product,
      brand,
      description: description || "",
      purchaseDate: purchaseDateObj, // Store as Date object
      warrantyPeriod: parseInt(warrantyPeriod), // Store as number
      expiryDate: expiryDate, // Store as Date object
      billImagePath: req.file ? `/uploads/${req.file.filename}` : undefined,
    });
    
    console.log("Warranty object to save:", newWarranty);
    
    await newWarranty.save();
    console.log("Warranty saved successfully");
    res.redirect("/main"); // after adding, redirect back
  } catch (err) {
    console.error("Error adding warranty:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      name: err.name
    });
    res.status(500).send(`Error adding warranty: ${err.message}`);
  }
});


router.post('/warranty/delete/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.session.user) return res.redirect("/login");

  try {
    await Warranty.findOneAndDelete({
      _id: id,
      user: req.session.user._id,
    });

    res.redirect('/main');
  } catch (err) {
    console.error('❌ Error deleting warranty:', err);
    res.status(500).send('Error deleting warranty.');
  }
});

module.exports = router;
