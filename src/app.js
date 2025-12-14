const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validations");
const bcrypt = require("bcrypt");
const validator = require("validator");

const app = express();

require("dotenv").config();

app.use(express.json());

app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error(`Invalid Email Address ${emailId}`);
    }

    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("This Email is not Valid");
    }
    const islogin = await bcrypt.compare(password, user.password);

    if (islogin) {
      res.send("user is Login successfully!");
    } else {
      throw new Error("Password is not valid!");
    }
  } catch (err) {
    res.status(400).send(`ERROR: ${err.message}`);
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password } = req.body;

    validateSignUpData(req);
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("user created Successfully");
  } catch (err) {
    res.status(400).send(`Signup failed: ${err.message}`);
  }
});

app.get("/user", async (req, res) => {
  try {
    const userEmailId = req.query.emailId;
    const users = await User.find({ emailId: userEmailId });
    if (!users) {
      res.status(404).send("user not found");
    } else {
      res.send(users);
    }
  } catch {
    res.status(400).send("something wents worng");
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch {
    res.status(400).send("something wents worng");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.query.id;
  try {
    await User.findByIdAndDelete(userId);

    res.send("User Deleted successfully");
  } catch {
    res.status(400).send("something wents worng");
  }
});

app.put("/user", async (req, res) => {
  const userId = req.query.id;
  const userData = req.body;
  try {
    await User.findByIdAndUpdate(userId, userData, { runValidators: true });
    res.send("User Update successfully");
  } catch (err) {
    res.status(400).send(`UPDATE failed:${err.message}`);
  }
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
