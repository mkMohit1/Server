const Contact = require('../models/contact-model');
const User = require('../models/User'); // Import User model
const nodemailer = require('nodemailer');
const { login } = require('./auth_controller');

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your mail provider (could be 'smtp.mailtrap.io' or others)
  auth: {
    user: 'mohityoga.2016@gmail.com',  // Use the email from your environment variable
    pass: 'ovpu rdrn ozqg pnsl',
  },
});

// Controller function to add the contact
const addContact = async (req, res) => {
  try {
const { mobileNumber, email, message, name, type } = req.body;

// Determine the query criteria based on available data
const query = mobileNumber ? { mobileNumber } : { loginWith: type };

// Find the user by the determined criteria
const contactAddInUser = await User.findOne(query);
    if (!contactAddInUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Email content
    const mailOptions = {
      to: 'mohityoga.2016@gmail.com', // Admin's email address
      subject: 'New Contact Form Submission',
      text: `You have received a new message from ${name} (${email || mobileNumber}):\n\nMessage: ${message}`,
    };

    // Send email to admin (use await for cleaner async handling)
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Failed to send notification');
    }

    // Create a new contact
    const newContact = new Contact({
      email,
      message,
      mobileNumber,
      Name: name, // Ensure correct casing of "Name"
    });

    // Save the contact
    const savedContact = await newContact.save();

    // Add the contact ID to the user's contacts array
    contactAddInUser.contacts.push(savedContact._id);

    // Save the updated user document
    await contactAddInUser.save();

     // Emit real-time notification to super admin
      if (global.superAdminSocket) {
        global.superAdminSocket.emit('newContactNotification', {
          message: `New contact form submitted by ${name}`,
          data: newContact,
        });
      }

    // Send a successful response
    res.status(201).json({
      success: true,
      message: "Contact added successfully.",
      contact: savedContact,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred.",
      error: error.message,
    });
  }
};

// Export the controller functions
module.exports = { addContact };
