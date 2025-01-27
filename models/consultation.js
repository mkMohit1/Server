const mongoose  = require('mongoose');

const consultationSchema = new mongoose.Schema({    
    mobileNumber: { type: String, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Consultation = mongoose.model('Consultation', consultationSchema, 'Consultations');
module.exports = Consultation;