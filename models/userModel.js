const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let date = new Date();

const userSchema = new Schema({
  username: { type: String, required: true},
  password: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now }

});
const User = mongoose.model("User", userSchema);

module.exports = User;
