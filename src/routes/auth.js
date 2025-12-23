const express = require("express");
const router = express.Router();
const { validateSignUpData } = require("../utils/validations");
const validator = require("validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");

router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error(`Invalid Email Address ${emailId}`);
    }

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const islogin = await user.validatePassword(password);

    if (!islogin) {
      throw new Error("Invalid Credentials");
    }

    const token = await user.getJWtToken();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });
    res.send("User logged in successfully!");
  } catch (err) {
    res.status(400).send(`ERROR: ${err.message}`);
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    validateSignUpData(req);
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("user created Successfully");
  } catch (err) {
    res.status(400).send(`Signup failed: ${err.message}`);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("User logged out successfully!");
});

module.exports = router;
