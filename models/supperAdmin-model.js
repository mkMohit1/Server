const mongoose = require('mongoose');

const supperAdminSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true, 
      },
      type:{
        type: String,
        default: "SupperAdmin"
      },
      email: {
        type: String,
        required: false,
      },
      name:{
        type: String,
        default: "SupperAdmin"
      },
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     saleAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleAdmin" }], // Array of SaleAdmin IDs
     productAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductAdmin" }], // Array of ProductAdmin IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const SupperAdmin = mongoose.model("SupperAdmin", supperAdminSchema, "Users");

module.exports = SupperAdmin;