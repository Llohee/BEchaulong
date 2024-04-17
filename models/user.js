const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  phone: String,
  created_time: String,
  users_submit: [String],
  role: [String],
});

const userModel = mongoose.model("users", userSchema);

module.exports = { userModel };
