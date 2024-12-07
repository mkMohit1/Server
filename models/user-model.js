const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true, 
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
