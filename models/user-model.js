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
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }], // Array of Contact IDs
});

const User = mongoose.model("User", userSchema);

module.exports = User;
