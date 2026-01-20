const express = require("express");
const router = express.Router();
const { validateSignUpData } = require("../utils/validations");
const validator = require("validator");
const User = require("../models/user");

const COOKIE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error(`Invalid Email Address ${emailId}`);
    }

    const user = await User.findOne({ emailId: emailId }).select("+password");

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const islogin = await user.validatePassword(password);

    if (!islogin) {
      throw new Error("Invalid Credentials");
    }

    const token = user.getJWTToken();

    res.cookie("token", token, {
      expires: new Date(Date.now() + COOKIE_EXPIRY),
      httpOnly: true,
    });
    res.status(200).json({
      message: "User logged in successfully!",
      data: user,
      accessToken: token,
    });
  } catch (err) {
    res.status(400).json({ message: `ERROR: ${err.message}` });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    validateSignUpData(req);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password,
    });
    await user.save();

    const token = user.getJWTToken();

    res.cookie("token", token, {
      expires: new Date(Date.now() + COOKIE_EXPIRY),
      httpOnly: true,
    });

    res.status(201).json({
      message: "User created successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
      },
      accessToken: token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(400).json({ message: err.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "User logged out successfully!" });
});

module.exports = router;
