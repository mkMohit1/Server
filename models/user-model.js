const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true, 
  },
  mobileNumber: {
    type: String,
    required: true, 
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  userLogo: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/128/2202/2202112.png",
  },
  otp: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
