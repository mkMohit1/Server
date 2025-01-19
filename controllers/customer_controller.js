const Address = require('../models/Address-model');
const User = require('../models/User');

// Fetch addresses based on user ID
const fetchAddressesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user and populate the addresses field
    const user = await User.findById(userId).populate('addresses');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Addresses fetched successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

// Function to add a new address
const addUserAddress = async (req, res) => {
  try {
    const { customerData, currentUser } = req.body;
    let populatedUser;
    console.log("address", req.body);
    // Check if the current user is a SaleManager
    const saleManager = await User.findOne({ _id: currentUser.userId, role: 'SaleManager' });
    if (!saleManager && currentUser.role !== 'CommonUser') {
      return res.status(404).json({ message: "Only SaleManager or CommonUser can add addresses" });
    }
    if (currentUser.role ==='CommonUser') {
      delete customerData.aadharNumber; // Remove the aadharNumber for non-admin users
    }
    // Check if user already exists by mobile number
    let existingUser = await User.findById({_id:currentUser.userId});
    console.log(existingUser);
    if (saleManager) {
      // Create a new user if not found
      const newUser = new User({
        mobileNumber: customerData.mobileNumber,
        email: customerData.email,
        name: customerData.name,
        role: 'CommonUser', // Default role for new users
      });

      await newUser.save();
      saleManager.customers.push(newUser._id);
        await saleManager.save();
      // console.log("mnk11");
      // Create new address and link it to the user
      const newAddress = new Address({ 
        ...customerData,
        addressType: customerData.addressType || 'House', // Default to 'House' if not provided
      });
      await newAddress.save();
      // console.log("mnk12");
      // Link address to the user
      newUser.addresses.push(newAddress._id);
      await newUser.save();

      return res.status(201).json({ message: "New user and their address added successfully", newUser });
    } 
    else {
      // If user exists, add a new address to the existing user
      const newAddress = new Address({ 
        ...customerData,
        addressType: customerData.addressType || 'House', // Default to 'House' if not provided
      });
      await newAddress.save();

      // Link new  to existing user
      existingUser.addresses.push(newAddress._id);
      await existingUser.save();
      // // Populate the addresses field to include full address details
      // populatedUser = await User.findById(currentUser.userId).populate('addresses');
      return res.status(200).json({ message: "Address added successfully", address: newAddress });
      }
    }
  catch (error) {
    console.error("Error adding user/address:", error);
    return res.status(500).json({ message: "Server error: " + error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id; // Get the address ID from the route parameters
    const { customerData, currentUser } = req.body; // Extract the new data and current user info from the request body
    console.log(req.body);
    console.log(req.params);
    // Validate current user's role, if necessary
    if (currentUser.role !== 'SaleManager' && currentUser.role !== 'CommonUser') {
      return res.status(403).json({ message: 'Unauthorized: Only admins and common users can update addresses' });
    }

    // Find the existing address by ID
    const address = await Address.findById(addressId);
    console.log("temp",address);
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

     // Update the address with the provided data
     Object.keys(customerData).forEach((key) => {
      if (!['_id', '__v', 'createdAt', 'updatedAt'].includes(key) && customerData[key] !== undefined) {
        address[key] = customerData[key];
      }
    });
    console.log("currentEddress",address);
    // Save the updated address
    await address.save();

    res.status(200).json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id; // Extract the address ID from the request parameters
    const { userId } = req.body; // User ID should be sent in the request body
    console.log(req.params);
    console.log(req.body);
    // Find the user who owns the address
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the address belongs to the user
    if (!user.addresses.includes(addressId)) {
      return res.status(403).json({ message: 'Address does not belong to the user' });
    }

    // Remove the address from the user's addresses array
    user.addresses = user.addresses.filter((id) => id.toString() !== addressId);
    await user.save();

    // Remove the address document from the database
    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Address removed successfully' });
  } catch (error) {
    console.error('Error removing address:', error);
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};


module.exports = { addUserAddress, updateAddress, fetchAddressesByUserId, deleteAddress};