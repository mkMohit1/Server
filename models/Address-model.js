const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    aadharNumber: {
      type: String,
      minlength: 12,
      maxlength: 12,
      unique: true,
      sparse: true, // Allows multiple null values
      validate: {
        validator: function (value) {
          return this.isAdmin ? value && value.length === 12 : true;
        },
        message: 'Aadhar number is required and must be 12 digits for admins.',
      },
    },
    isAdmin: {
      type: Boolean, // Include isAdmin in the schema for validation purposes
      default: false, // Default to false
    },
    addressType: {
      type: String,
      enum: ['Permanent', 'Temporary', 'House', 'Office'],
      required: true,
    },
    district: {
      type: String,
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'District is required for admins.',
      },
    },
    email: {
      type: String,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'Valid email is required for admins.',
      },
    },
    houseNumber: {
      type: String,
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'House number is required for admins.',
      },
    },
    landmark: { type: String },
    name: {
      type: String,
      required: true, // Always required
    },
    occupation: {
      type: String,
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'Occupation is required for admins.',
      },
    },
    mobileNumber: {
      type: String,
      minlength: 10,
      maxlength: 10,
      required: true,
    },
    postOffice: {
      type: String,
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'Post office is required for admins.',
      },
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
      validate: {
        validator: function (value) {
          // Only required for admin users
          return this.isAdmin ? !!value : true;
        },
        message: 'Sub-district is required for admins.',
      },
    },
    zipCode: {
      type: String,
      minlength: 6,
      maxlength: 6,
      required: true,
    },
    isKyc: {
      type: Boolean,
      default: false,
    },
    commonUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'commonUsers',
    },
    isAdmin: {
      type: Boolean, // Indicates whether the address was added by an admin
      default: false,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema, 'Addresses');
module.exports = Address;
