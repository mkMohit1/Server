const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  aadharNumber: {
    type: String,
    required: true,
    unique: true,
    minlength: 12,
    maxlength: 12,
  },
  addressType: {
    type: String,
    enum: ['Permanent', 'Temporary'],
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
  },
  houseNumber: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  occupation: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
  },
  postOffice: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  subDistrict: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 6,
  },
  isKyc: {
    type: Boolean,
    default: false,
  },
  commonUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'commonUsers', // Reference to commonUsers model
    required: false, // Optional: You can choose whether to make this field required
  }
}, {
  timestamps: true
});

// Create a model for the schema
const Address = mongoose.model('Address', addressSchema, 'Addresses');

module.exports = Address;
