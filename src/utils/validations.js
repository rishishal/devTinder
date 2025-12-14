const Validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName) {
    throw new Error("FirstName is required");
  } else if (!lastName) {
    throw new Error("LastName is required");
  } else if (!Validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!Validator.isStrongPassword) {
    throw new Error("Please enter a strong password");
  }
};

module.exports = {
  validateSignUpData,
};
