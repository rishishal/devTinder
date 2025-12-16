const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    const verifyToken = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = verifyToken;
    const user = await User.findById(_id);

    if (!user) {
      res.status(404).send("user not found");
    } else {
      req.user = user;
    }
    next();
  } catch (error) {
    res.status(400).send(`something wents worng :${error}`);
  }
};

module.exports = userAuth;
