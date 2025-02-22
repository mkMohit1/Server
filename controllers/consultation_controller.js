const Consultation = require('../models/consultation');
const User = require('../models/User');

const addConsultation = async(req, res) => {
    const { mobileNumber } = req.body;
    try {
        // Check if the mobile number already exists
        const consultation = await Consultation.findOne({ mobileNumber });
        if (consultation && consultation.status === 'pending') {
          return res.status(400).json({ message: "Team is little busy and we will connect with you shortly within weak" });
        }
        await Consultation.create({ mobileNumber });
        return res.status(200).json({ message: "Thanks for the connecting and will connect with you shortly" });
        }
        catch (error) {
        console.error("Error adding consultation:", error);
        return res.status(500).json({ message: "Failed to add consultation" });
    }
};

const fetchConsultation = async (req, res) => {
    try {
        const consultations = await Consultation.find();
        return res.status(200).json({ data:consultations });
    } catch (error) {
        console.error("Error fetching consultation:", error);
        return res.status(500).json({ message: "Failed to fetch consultation" });
    }
};

const updateConsultation = async (req, res) => {
    const { id } = req.params;
    try {
        const consultation = await Consultation.findById(id);
        if (!consultation) {
            return res.status(404).json({ message: "Consultation not found" });
        }
        consultation.status = 'completed';
        await consultation.save();
        return res.status(200).json({ message: "Consultation updated successfully" });
    } catch (error) {
        console.error("Error updating consultation:", error);
        return res.status(500).json({ message: "Failed to update consultation" });
    }
}

const deleteConsultation = async (req,res) => {
    const {id} = req.params;
    try {
        const deleteConsult = await Consultation.findById(id);
        if(!deleteConsult){
            return res.status(404).json({ message: "Consultation not found" });
        }
        await Consultation.findByIdAndDelete(id);
        return res.status(200).json({message: `Consultation ${deleteConsult.mobileNumber} deleted successfully`});
        
    } catch (error) {
        console.error("Error deleting consultation:", error);
        return res.status(500).json({ message: "Failed to delete consultation" });
    }
}

module.exports = {
    addConsultation,
    fetchConsultation,
    updateConsultation,
    deleteConsultation
};