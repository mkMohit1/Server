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
  name:{
    type: String,
    default: "User"
  },
  userImage:{
    type: String,
    default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
 },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }], // Array of Contact IDs
});

const User = mongoose.model("User", userSchema);

module.exports = User;
