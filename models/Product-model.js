const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    slug:{
        type: String,
        required: true,
    },
    mrp: {
        type: Number,
        required: true,
        default: 0,
    },
    rentQuantity: {
        type: Number,
        required: false,
        default: 1,
    },
    saleQuantity: {
        type: Number,
        required: false,
        default: 1,
    },
    discount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    stauts:{
        type: String,
        default: "Active",  
    },
    productImage: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/128/2202/2202112.png',
    },
    productAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "ProductAdmin" }, // ProductAdmin ID
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model("Product", productSchema, "Products");   // creat a Product Collection

module.exports = Product;