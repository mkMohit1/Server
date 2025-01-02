const Address = require('../models/Address-model');
const User = require('../models/commonUser-model');
const SaleManager = require('../models/saleManager-model');

// Function to add a new address
const addUserAddress = async (req, res) => {
  try {
    const { customerData, currentUser } = req.body;

    // Check if saleManager exists based on currentUser
    const saleManager = await SaleManager.findOne({ mobileNumber: currentUser.mobileNumber });
    if (!saleManager) {
      return res.status(404).json({ message: "SaleManager not found for the given user" });
    }

    // Check if user already exists by mobile number
    let existingUser = await User.findOne({ mobileNumber: customerData.mobileNumber });

    if (!existingUser) {
      // Create a new user if not found
      const newUser = new User({
        mobileNumber: customerData.mobileNumber,
        email: customerData.email,
        name: customerData.name,
      });

      await newUser.save();

      // Add the new user to the saleManager's customers list
      saleManager.customers.push(newUser._id);
      await saleManager.save();

      // Create new address and link it to the user
      const newAddress = new Address({ ...customerData });
      await newAddress.save();

      // Link address to the user
      newUser.addresses= newAddress._id;
      await newUser.save();

      return res.status(201).json({ message: "New user and their address added successfully", newUser });
    } else {
      // If user exists, add a new address to the existing user
      const newAddress = new Address({ ...customerData });
      await newAddress.save();

      // Link new address to existing user
      existingUser.addresses.push(newAddress._id);

      // Update user details if necessary
      existingUser.name = customerData.name; // Update name
      existingUser.email = customerData.email; // Update email if needed
      await existingUser.save();

      // Check if the user is already present in the saleManager's customers list
      const isPresent = saleManager.customers.find(
        (customer) => customer.toString() === existingUser._id.toString()
      );
      
      if (!isPresent) {
        saleManager.customers.push(existingUser._id);
        await saleManager.save();
      }

      return res.status(200).json({ message: "Address added successfully", user: existingUser });
    }
  } catch (error) {
    console.error("Error adding user/address:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { addUserAddress };
