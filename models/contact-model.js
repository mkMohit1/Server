const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true, 
  },
  mobileNumber:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
