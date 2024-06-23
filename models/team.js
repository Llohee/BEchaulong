const mongoose = require("mongoose");
const { userModel } = require("./user");

const submittedUserSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  description: { type: String, required: false },
  image: { type: String },
  score: { type: Number },
  comment: {type: String},
  submitted_time: { type: Date, required: true },
});

const homeworkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  image: { type: String },
  is_active: { type: String },
  submitted_users: [submittedUserSchema],
});
homeworkSchema.pre("save", function (next) {
  const now = new Date();
  if (this.start_time <= now && now <= this.end_time) {
    this.is_active = "true";
  } else {
    this.is_active = "false";
  }
  next();
});
const teamSchema = new mongoose.Schema({
  name: String,
  description: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  video: String,
  homework: [homeworkSchema],
  create_date: { type: Date, default: Date.now },
});

const teamModel = mongoose.model("teams", teamSchema);

module.exports = { teamModel };
