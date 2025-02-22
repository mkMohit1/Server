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

const fetchSubscription = async(req,res)=>{
  try {
    const subscription = await Subscription.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: subscription});
  } catch (error) {
    console.error("Error fetching subscription:", error);
        return res.status(500).json({ message: "Failed to add subscription" });
  }
}

const deleteSubscription = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteSubscibe = await Subscription.findById(id);

    if (!deleteSubscibe) {
      return res.status(404).json({ message: `No subscription found with ID: ${id}` });
    }

    await Subscription.findByIdAndDelete(id);

    return res.status(200).json({ message: `Subscription (${deleteSubscibe.email}) deleted successfully.` });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return res.status(500).json({ message: "Failed to delete subscription" });
  }
};

module.exports = {
    addSubscription,
    fetchSubscription,
    deleteSubscription
};