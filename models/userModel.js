const Mongoose = require("mongoose");

const userSchema = new Mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    lowercase: true,
    type: String,
    unique: true,
    required: true,
  },
  phone_number: {
    type: Number,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  zipcode: {
    type: Number,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  city: {
    type: String,
  },
  district: {
    type: String,
  },
  image: {
    type: String,
    default: "",
  },
  otpcode: {
    type: Number,
    default: 0,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  resetLink: {
    type: String,
    default: "notreset",
  },
  Created_at: {
    type: String,
    required: true,
  },
});

const userModel = Mongoose.model("User", userSchema);

module.exports = userModel;
