const mongoose= require('mongoose');

const productAdminSchema = new mongoose.Schema({
    mobileNumber: {
        type: String,
        required: true, 
      },
      type:{
        type: String,
        default: "ProductAdmin"
      },
      email: {
        type: string,
        required: ture,
      },
      name:{
        type: String,
        default: "ProductAdmin"
      },
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Products" }], // Array of Products IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const ProductAdmin = mongoose.model("ProductAdmin", productAdminSchema, "Users");   // creat a ProductAdmin Collection  

module.exports = ProductAdmin;