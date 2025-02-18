const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    coupon: { type: String },
    amountPay: { type: Number, required: true, min: 0 },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'cancelled', 'assigned'], 
        default: 'pending' 
    },
    bookNow: { type: Boolean, default: false },
    paymentMethod: { 
        type: String, 
        enum: ['COD', 'Credit Card', 'UPI', 'Net Banking'], 
        default: 'COD' 
    },
    paymentID: { type: String },
    address: {type: mongoose.Schema.Types.ObjectId, ref:'Address', required:true},
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

transactionSchema.index({ userID: 1, status: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema, 'Transaction');
module.exports = Transaction;
