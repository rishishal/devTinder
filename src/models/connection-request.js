const mongoose = require("mongoose");
const connectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "blocked"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

connectionRequestSchema.pre("save", async function () {
  if (this.sender.toString() === this.receiver.toString()) {
    throw new Error("Sender and receiver cannot be the same");
  }
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);
