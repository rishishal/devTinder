const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },

    lastName: String,

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email address",
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: validator.isStrongPassword,
        message: "Enter a strong password",
      },
    },

    passwordChangedAt: Date,

    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [50, "Age must be at most 50"],
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female or other",
      },
    },

    skills: {
      type: [String],
    },

    bio: {
      type: String,
      maxlength: [250, "Bio must be less than 250 characters"],
      default: "This is about user",
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// For CREATE & save()
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
});

// For updates Password
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();

  const password = update.password || update.$set?.password;

  if (!password) return;

  const hashed = await bcrypt.hash(password, 10);

  if (update.password) {
    update.password = hashed;
    update.passwordChangedAt = new Date();
  } else {
    if (!update.$set) {
      update.$set = {};
    }
    update.$set.password = hashed;
    update.$set.passwordChangedAt = new Date();
  }
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

userSchema.methods.validatePassword = function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
