const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, unique: true },
  email: { type: String, required: false },
  name: { type: String, default: "User" },
  userImage: { type: String, default: 'https://cdn-icons-png.flaticon.com/128/2202/2202112.png' },
  loginWith: { type: String, required: true }, // e.g., 'whatsapp', 'voice', 'google'
  role: {
    type: String,
    enum: ['SuperAdmin', 'ProductAdmin', 'SaleAdmin', 'SaleManager', 'CommonUser'],
    default: 'CommonUser',
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for role-specific data
    default: {},
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;
