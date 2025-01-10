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
        type: String,
        required: true,
      },
      name:{
        type: String,
        default: "ProductAdmin"
      },
      SupperAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "SupperAdmin" }, // ProductAdmin ID
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     loginWith:{
      type: String,
      require:true
     },     
     products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }], // Array of Products IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const ProductAdmin = mongoose.model("ProductAdmin", productAdminSchema, "Users");   // creat a ProductAdmin Collection  

module.exports = ProductAdmin;