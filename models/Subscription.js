
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema, 'Subscriptions');

module.exports = Subscription;