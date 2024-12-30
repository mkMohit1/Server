const mongoose = require('mongoose');

const commonUserSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true, 
  },
  type:{
    type: String,
    default: "commonUser"
  },
  email: {
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

// let add commonUserSchema to the User collection database
const User = mongoose.model("commonUsers", commonUserSchema, "Users");

module.exports = User;
