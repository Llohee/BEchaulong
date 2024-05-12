const mongoose = require("mongoose");
// const moment = require("moment");
const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  phone: String,
  birthday: { type: Date },
  users_submit: [String],
  role: [String],
  create_date: { type: Date, default: Date.now },
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
