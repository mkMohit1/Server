const mongoose= require('mongoose');

const saleAdminSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true, 
      },
      type:{
        type: String,
        default: "SaleAdmin"
      },
      email: {
        type: String,
        required: true,
      },
      name:{
        type: String,
        default: "SaleAdmin"
      },
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     saleManger: [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleManager" }], // Array of SaleManager IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const SaleAdmin = mongoose.model("SaleAdmin", saleAdminSchema, "Users");   // creat a SaleAdmin Collection

module.exports = SaleAdmin;