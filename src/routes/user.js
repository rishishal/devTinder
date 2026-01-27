const express = require("express");
const router = express.Router();
const ConnectionRequest = require("../models/connection-request");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName skills bio gender age avatar";

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

router.get("/feed", userAuth, async (req, res) => {
  try {
    const user = req.user;
    let limit = parseInt(req.query.limit, 10) || 10;
    limit = Math.min(Math.max(limit, 1), 50);
    let page = parseInt(req.query.page, 10) || 1;
    page = Math.max(page, 1);
    const skip = (page - 1) * limit;

    const relationUsers = await ConnectionRequest.find({
      $or: [{ receiver: user._id }, { sender: user._id }],
    }).select("receiver sender");

    const hideUserFromFeed = new Set();
    relationUsers.forEach((r) => {
      if (r.receiver && r.receiver._id)
        hideUserFromFeed.add(r.receiver._id.toString());
      if (r.sender && r.sender._id)
        hideUserFromFeed.add(r.sender._id.toString());
    });
    hideUserFromFeed.add(user._id.toString());

    const filter = { _id: { $nin: Array.from(hideUserFromFeed) } };
    const total = await User.countDocuments(filter);

    const feedData = await User.find(filter)
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({
      data: feedData,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
