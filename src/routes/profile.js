const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/auth");

router.get("/profile", userAuth, (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch {
    res.status(400).send("something wents worng");
  }
});

module.exports = router;
