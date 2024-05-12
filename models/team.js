const mongoose = require("mongoose");
const { userModel } = require("./user");

const teamSchema = new mongoose.Schema({
  name: String,
  description: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  video: String,
  homwork: String,
  homeworktable: String,
  create_date: { type: Date, default: Date.now },
});

const teamModel = mongoose.model("teams", teamSchema);

module.exports = { teamModel };
