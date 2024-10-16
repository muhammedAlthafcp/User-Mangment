var express = require("express");
var router = express.Router();
var session = require("express-session");
var comeon = require("../Models/mongodb");
// var products = require("../Models/products");
const bcrypt = require('bcrypt');
const isAuth = require('../Models/isAuth');
const Back = require("../Models/Back");

// Middleware to protect routes and prevent cache
router.get("/", function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/home");
  } else {
    res.render("login");
  }
});

// Home route
router.get("/home",isAuth, Back, function (req, res) {
  if (req.session.user) {
    res.render("home");
  } else {
    res.render("login");
  }
});


// Login (Submit) route
router.post("/submit", async function (req, res) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await comeon.findOne({ email });
    console.log(user); // Log user data for debugging

    if (!user) {
      return res.render("login", { invalid: "Invalid email or user ID" });
    }

    // Compare provided password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("login", { invalid: "Invalid password" });
    }

    // Set session data
    req.session.loggedIn = true;
    req.session.user = { id: user._id, name: user.name, email: user.email, gender: user.gender };

    // Redirect based on user type (admin or regular user)
    if (user.email === "admin@gmail.com") {
      return res.redirect('/admin');
    } else {
      return res.redirect('/home');
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.render("login", { invalid: "An error occurred, please try again." });
  }
});

// Admin route (restricted to admins)
router.get('/admin', isAuth, async (req, res) => {
  if (req.session.user.email !== "admin@gmail.com") {
    return res.status(403).send('Access Denied');
  }
  
  try {
    const users = await comeon.find({});
    res.render("admin", { users });
  } catch (error) {
    console.log('Error fetching users:', error);
    res.status(500).send('Server Error');
  }
});

// Logout (Signout) route
router.get("/signout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Session destruction error:", err);
      return res.status(500).send("Error logging out. Please try again.");
    }

    // Redirect to login page after successful logout
    res.render('login', { message: 'You have been logged out.' });
  });
});

// Sign up route
router.get("/signup", function (req, res) {
  res.render("signup");
});

// Register route
router.post("/register", async function (req, res) {
  try {
    const { name, email, password, gender } = req.body;

    // Check if the user already exists
    const existingUser = await comeon.findOne({ email });
    if (existingUser) {
      return res.render("signup", { invalid: "Email already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the hashed password
    await comeon.create({ name, email, password: hashedPassword, gender });

    // Store necessary user details in session
    req.session.user = { name, email, gender };
    req.session.loggedIn = true;

    // Redirect to home page after successful registration
    res.redirect('/home');
  } catch (error) {
    console.log(error);
    res.render("signup", { invalid: "An error occurred during registration." });
  }
});

module.exports = router;
