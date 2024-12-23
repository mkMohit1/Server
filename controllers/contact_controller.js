const Contact = require('../models/contact-model');
// controller function to add the contact
const addContact = async (req, res) => {
    try {
        console.log(req.body);
      const { mobile, email, message, name } = req.body;
        console.log(req.body);
      // Find the user by ID
      const contactAddInUser = await User.findOne({mobileNumber:mobile});
        console.log(contactAddInUser);
      if (!contactAddInUser) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Create a new contact
      const newContact = new Contact({
        email,
        message,
        Name:name, // Make sure the property matches
      });
  
      // Save the contact
      const savedContact = await newContact.save();
  
      // Add the contact ID to the user's contacts array
      contactAddInUser.contacts.push(savedContact._id);
  
      // Save the updated user document
      await contactAddInUser.save();
  
      res.status(201).json({
        success: true,
        message: "Contact added successfully.",
        contact: savedContact,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred.",
        error: error.message,
      });
    }
  };

// Export the controller functions
module.exports = { addContact };