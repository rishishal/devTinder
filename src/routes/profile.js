const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const userAuth = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validations");

router.get("/:id", userAuth, async (req, res) => {
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).send("Invalid user id");
  }

  try {
    const user = await User.findById(userId).select("-password -__v");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).send(`Error fetching user: ${err.message}`);
  }
});

router.get("/all", userAuth, async (req, res) => {
  try {
    const users = await User.find({}).select("-password -__v");
    res.json(users);
  } catch (err) {
    res.status(500).send(`Error fetching users: ${err.message}`);
  }
});

router.delete("/delete", userAuth, async (req, res) => {
  const userId = req.query.id;
  try {
    await User.findByIdAndDelete(userId);

    res.send("User Deleted successfully");
  } catch {
    res.status(400).send("something wents worng");
  }
});

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
