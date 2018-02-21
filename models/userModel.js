const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');
let date = new Date();

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true},
  firstName: { type: String, unique: false, required: true},
  lastName: { type: String, unique: false, required: true},
  password: { type: String, unique: false, required: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isAdmin: { type: Boolean, default: false }
},{
  timestamps: true
});
userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

module.exports = User;
