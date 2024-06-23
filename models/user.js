const mongoose = require("mongoose");
// const moment = require("moment");
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  birthday: { type: Date },
  code: { type: String },
  school: { type: String },
  role: [{ type: String }],
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
});

// userSchema.pre("save", function (next) {
//   if (this.birthday) {
//     if (!(this.birthday instanceof Date)) {
//       this.birthday = new Date(this.birthday);
//     }
//   }
//   this.create_date = moment().format("HH:mm DD/MM/YYYY");
//   next();
// });

const userModel = mongoose.model("users", userSchema);

module.exports = { userModel };
