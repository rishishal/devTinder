const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch {
    res.status(400).send("something wents worng");
  }
});

router.delete("/user", async (req, res) => {
  const userId = req.query.id;
  try {
    await User.findByIdAndDelete(userId);

    res.send("User Deleted successfully");
  } catch {
    res.status(400).send("something wents worng");
  }
});

router.put("/user", async (req, res) => {
  const userId = req.query.id;
  const userData = req.body;
  try {
    await User.findByIdAndUpdate(userId, userData, { runValidators: true });
    res.send("User Update successfully");
  } catch (err) {
    res.status(400).send(`UPDATE failed:${err.message}`);
  }
});

module.exports = router;
