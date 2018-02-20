const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let date = new Date();

const userSchema = new Schema({
  username: { type: String, unique: true, required: true},
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isAdmin: { type: Boolean, default: false }
},{
  timestamps: true
});
const User = mongoose.model("User", userSchema);

module.exports = User;
