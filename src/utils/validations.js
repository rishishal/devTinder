const Validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName) {
    throw new Error("FirstName is required");
  } else if (!lastName) {
    throw new Error("LastName is required");
  } else if (!Validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!Validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
};

const validateEditProfileData = (req) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "bio",
    "gender",
  ];

  const IsEditAllowed = Object.keys(req.body).every((field) =>
    allowedFields.includes(field)
  );
  return IsEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
