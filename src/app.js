const express = require("express");
const adminAuth = require("./middleware/auth");
const connectDB = require("./config/db");

const app = express();
require("dotenv").config();

app.use("/admin", adminAuth);

app.get("/admin/getalldata", (req, res) => {
  res.send("get all admins data");
});

app.get("/users", (req, res) => {
  res.send({
    name: "Rishi kumar",
    age: "23",
    role: "FrontEnd Developer",
  });
});

app.get("/users/data", (req, res) => {
  throw new Error("fdbfdsjb");
  res.send("User Data send");
});

app.use("/", (req, res) => {
  res.status(500).send("something went wrong");
});

// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
