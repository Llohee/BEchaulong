const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: [String],
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "songs" }],
});

const userModel = mongoose.model("users", userSchema);

module.exports = { userModel };
