const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: { 
        type: String, 
        required: function () { 
            return this.loginWith === 'whatsapp' || this.loginWith === 'voice'; 
        }, 
        unique: true },
    email: { type: String, required: false },
    name: { type: String, default: "User" },
    userImage: { type: String, default: 'https://cdn-icons-png.flaticon.com/128/2202/2202112.png' },
    userBackgroundImage: { type: String }, // Optional background image
    loginWith: { type: String, required: true }, // e.g., 'whatsapp', 'voice', 'google'
    role: {
        type: String,
        enum: ['SuperAdmin', 'ProductAdmin', 'SaleAdmin', 'SaleManager', 'CommonUser'],
        default: 'CommonUser',
    },
    saleAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For SuperAdmin
    productAdmin: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For SuperAdmin
    saleManager: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For SaleAdmin
    customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For SaleManager
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // General user connections
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }], // For storing user addresses
    cart: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, default: 1 },
            addedAt: { type: Date, default: Date.now },
        },
    ],    
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'Users');
module.exports = User;
