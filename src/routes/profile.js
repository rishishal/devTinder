const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const { userAuth } = require("../middleware/auth");
const { filterAllowedFields } = require("../utils/validations");

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
  const userId = req.user._id;
  try {
    await User.findByIdAndDelete(userId);

    res.send("User Deleted successfully");
  } catch (err) {
    res.status(500).send(`Error deleting user: ${err.message}`);
  }
});

// Update user profile
router.put("/update", userAuth, async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "emailId",
      "age",
      "gender",
      "skills",
      "bio",
    ];

    const isEditAllowed = Object.keys(req.body).every((field) =>
      allowedFields.includes(field)
    );

    if (!isEditAllowed) {
      return res.status(400).json({
        error: "Invalid fields in update request",
      });
    }

    const updateData = filterAllowedFields(req.body, allowedFields);

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updateData },
      {
        returnDocument: "after",
        runValidators: true,
        context: "query",
      }
    );

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/change-password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Update password (query update)
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { password: newPassword } },
      {
        runValidators: true,
        context: "query",
      }
    );

    // Clear the token cookie to force re-login
    res.clearCookie("token");

    res.json({
      message: "Password updated successfully. Please login again.",
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
