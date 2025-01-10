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
      SupperAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "SupperAdmin" }, // SaleAdmin ID
      userImage:{
        type: String,
        default:'https://cdn-icons-png.flaticon.com/128/2202/2202112.png'
     },
     userBackgroundImage:{
      type: String,
      default: 'https://png.pngtree.com/thumb_back/fh260/background/20230408/pngtree-rainbow-curves-abstract-colorful-background-image_2164067.jpg'
     },
     loginWith:{
      type: String,
      require:true
     },
     saleManager: [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleManager" }], // Array of SaleManager IDs
     createdAt: {
        type: Date,
        default: Date.now,
      },
});

const SaleAdmin = mongoose.model("SaleAdmin", saleAdminSchema, "Users");   // creat a SaleAdmin Collection

module.exports = SaleAdmin;