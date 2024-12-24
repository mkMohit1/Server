const mongoose= require('mongoose');

const saleManagerSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true, 
      },
      type:{
        type: String,
        default: "SaleManager"
      },
      email: {
        type: String,
        required: true,
      },
      name:{
        type: String,
        default: "SaleManager"
      },
      SaleAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "SaleAdmin" }, // SaleAdmin ID
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     UserWithKyc: [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleManager" }], // Array of SaleManager IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const SaleManager = mongoose.model("SaleManager", saleManagerSchema, "Users");   // creat a SaleAdmin Collection

module.exports = SaleManager;