const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/connection-request");
const { userAuth } = require("../middleware/auth");

const USER_SAFE_DATA = "firstName lastName skills bio gender age";

router.get("/request/received", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const connectionRequests = await ConnectionRequest.find({
      receiver: user._id,
      status: "interested",
    }).populate("sender", USER_SAFE_DATA);

    res.status(200).json({ connectionRequests });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/connections", userAuth, async (req, res) => {
  try {
    const user = req.user;

    const UserConnections = await ConnectionRequest.find({
      $or: [
        { receiver: user._id, status: "accepted" },
        { sender: user._id, status: "accepted" },
      ],
    })
      .populate("receiver", USER_SAFE_DATA)
      .populate("sender", USER_SAFE_DATA);

    const modifiedConnections = UserConnections.map((connection) => {
      if (connection.receiver._id.toString() === user._id.toString()) {
        return connection.sender;
      }
      return connection.receiver;
    });

    res.status(200).json({ modifiedConnections });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
