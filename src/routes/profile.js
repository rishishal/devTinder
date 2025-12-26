const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const userAuth = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validations");

// Fetch current user profile
router.get("/me", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json(user);
  } catch (err) {
    res.status(500).send(`Error fetching user: ${err.message}`);
  }
});

// Fetch other user Profile by ID
router.get("/:id", userAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).send("Invalid id");
    const user = await User.findById(id).select("-password -__v");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).send(`Error fetching user: ${err.message}`);
  }
});

// Fetch all users

router.get("/all", userAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-password -__v");
    res.json(users);
  } catch (err) {
    res.status(500).send(`Error fetching users: ${err.message}`);
  }
});

// Delete user by ID
router.delete("/delete", userAuth, async (req, res) => {
  const userId = req.query.id;
  try {
    await User.findByIdAndDelete(userId);

    res.send("User Deleted successfully");
  } catch {
    res.status(400).send("something wents worng");
  }
});

// Update user profile
router.put("/update", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Update Request!");
    }
    const user = req.user;
    res.send("User Update successfully");
  } catch (err) {
    res.status(400).send(`UPDATE failed:${err.message}`);
  }
});

module.exports = router;
