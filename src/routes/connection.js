const express = require("express");
const ConnectionRequest = require("../models/connection-request");
const User = require("../models/user");
const router = express.Router();
const { userAuth } = require("../middleware/auth");

router.post("/send/:status/:receiverUserId", userAuth, async (req, res) => {
  try {
    const { status, receiverUserId } = req.params;
    const user = req.user;

    const allowedStatus = ["interested", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const receiverUser = await User.findById(receiverUserId);
    if (!receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }
    let connectionRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: user._id, receiver: receiverUser._id },
        { sender: receiverUser._id, receiver: user._id },
      ],
    });

    if (connectionRequest) {
      if (connectionRequest.status === status) {
        return res
          .status(400)
          .json({ error: "Connection request already exists" });
      }

      connectionRequest.status = status;
      await connectionRequest.save();

      return res
        .status(200)
        .json({ message: "Connection request updated successfully" });
    }
    connectionRequest = new ConnectionRequest({
      sender: user._id,
      receiver: receiverUser._id,
      status: status,
    });
    await connectionRequest.save();
    return res
      .status(200)
      .json({ message: "Connection request sent successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/respond/:requestId/:action", userAuth, async (req, res) => {
  try {
    const { requestId, action } = req.params;
    const user = req.user;

    const allowedActions = ["accepted", "rejected", "blocked"];

    if (!allowedActions.includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const connectionResponse = await ConnectionRequest.findOne({
      _id: requestId,
      receiver: user._id,
      status: "interested",
    });

    if (!connectionResponse) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connectionResponse.status = action;

    const data = await connectionResponse.save();
    res.status(200).json({ message: `Connection request ${action}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
