const Subscription = require('../models/Subscription');

const addSubscription = async(req, res) => {
    const { email } = req.body;
    try {
        // Check if the email already exists
        const subscription = await Subscription.findOne({ email });
        if (subscription) {
          return res.status(400).json({ message: "Subscription already exists" });
        }
    
        // Add new subscription
        await Subscription.create({ email });
        return res.status(200).json({ message: "Subscription added successfully" });
      } catch (error) {
        console.error("Error adding subscription:", error);
        return res.status(500).json({ message: "Failed to add subscription" });
      }
}

module.exports = {
    addSubscription,
};