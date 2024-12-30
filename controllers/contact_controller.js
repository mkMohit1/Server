const Contact = require('../models/contact-model');
const User = require('../models/commonUser-model'); // Import User model
const nodemailer = require('nodemailer');

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
    const { mobile, email, message, name } = req.body;

    // Find the user by mobile number
    const contactAddInUser = await User.findOne({ mobileNumber: mobile });
    if (!contactAddInUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Email content
    const mailOptions = {
      from: email,
      to: 'mohityoga.2016@gmail.com', // Admin's email address
      subject: 'New Contact Form Submission',
      text: `You have received a new message from ${name} (${email}, ${mobile}):\n\nMessage: ${message}`,
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
      Name: name, // Ensure correct casing of "Name"
    });

    // Save the contact
    const savedContact = await newContact.save();

    // Add the contact ID to the user's contacts array
    contactAddInUser.contacts.push(savedContact._id);

    // Save the updated user document
    await contactAddInUser.save();

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
