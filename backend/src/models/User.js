const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

/* 
  User model:
  - full name, username, email, phone number, password, role, profile picture and date of creation
*/

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  phonenumber: { type: Number, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
    required: true,
  },
  profilePicture: {
    type: String,
    default:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/*
    Generate token method using user's id:
    - Token is signed with key from process.env.JWTPRIVATEKEY
    - Token is valid for 7 days (expiresIn)
*/

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

/*
    Validate user data (when registering and updating) using Joi.
    - passwordComplexity
    - email
    - phonenumber
*/
const validate = (data) => {
  const complexityOptions = {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(50).required().label("Full Name"),
    userName: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .label("Username"),
    email: Joi.string().email().lowercase().max(100).required().label("Email"),
    phonenumber: Joi.string()
      .pattern(/^\d{9}$/)
      .required()
      .label("Phone number"),
    password: passwordComplexity(complexityOptions)
      .required()
      .label("Password"),
    profilePicture: Joi.string().uri().optional().label("Profile Picture"),
    role: Joi.string().valid("user", "admin").optional().label("Role"),
  });
  return schema.validate(data);
};

module.exports = { User, validate };
