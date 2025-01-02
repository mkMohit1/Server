const User = require("../models/commonUser-model");
const SupperAdmin = require("../models/supperAdmin-model");
const SaleAdmin = require("../models/saleAdmin-model");
const SaleManager = require("../models/saleManager-model");
const ProductAdmin = require("../models/productAdmin-model");
const Product = require('../models/Product-model');
const Address = require('../models/Address-model');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

// Controller function to handle home route
const home = async (req, res) => {
    try {
        res.status(200).send("Welcome to the auth router!");
    } catch (error) {
        console.log("Error:", error);
    }
};

// Controller function to handle user registration
const register = async (req, res) => {
    try {
        const { userName, mobileNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ mobileNumber });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ userName, mobileNumber });
        await newUser.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller function for user login
const login = async (req, res) => {
    try {
        console.log(req.body);
        return res.status(200).json(req.body);
    } catch (error) {
        return res.status(400).json("Internal Server Error");
    }
};

// fetchAdmin controller function
const fetchAdmin = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        console.log("dbngrghhgrefg",req.params);
		const admin = await SupperAdmin.findOne({ mobileNumber }) 
            || await SaleAdmin.findOne({ mobileNumber }) 
            || await ProductAdmin.findOne({ mobileNumber: mobileNumber });
        console.log(admin);
        if (!admin) {
            return res.status(400).json({ message: "MobileNumber are required" });
        }
        if(admin.type === 'SupperAdmin'){
			const populatedAdmin = await SupperAdmin.findById(admin._id).populate('saleAdmin').populate('productAdmin');
            const allAdminData = [
                ...(populatedAdmin.saleAdmin || []),
                ...(populatedAdmin.productAdmin || [])
            ];

            return res.status(200).json(allAdminData);
        }
        if(admin.type === 'SaleAdmin'){
            const populatedAdmin = await SaleAdmin.findById(admin._id).populate('saleManager');
            const allAdminData = [
                ...populatedAdmin.saleManager || []
            ];
            return res.status(200).json(allAdminData);
        }
        if(admin.type === 'SaleManager'){
            const populatedAdmin = await SaleManager.findById(admin._id)
                .populate({
                    path: 'customers',
                    populate: {
                    path: 'addresses',
                    model: 'Address',
                    options: { lean: true }  // This will ensure addresses are also populated as plain objects
                    },
                    options: { lean: true }  // This ensures customers are populated as plain objects
                })
                .lean();  // This ensures the SaleManager itself is a plain object
                // Log the result to inspect the populated data
                console.dir(populatedAdmin.customers, { depth: null });
            return res.status(200).json({customers: populatedAdmin.customers});
        }
        return res.status(400).json({ message: "Invalid admin type" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const addAdmin = async (req, res) => {
    try {
      console.log(req.body);
      const { mobileNumber, name, email, type, supperAdminID } = req.body;
  
      // Check if the mobile number is already registered
      const allUser = await User.find({ mobileNumber });
      if (allUser.length > 0) {
        return res.status(400).json({ error: `This mobile number ${mobileNumber} is already registered` });
      }
  
      // Validate admin type
      if (!['SaleAdmin', 'ProductAdmin', 'SaleManager'].includes(type)) {
        return res.status(400).json({ error: 'Invalid admin type provided' });
      }
  
      // Logic for handling SaleAdmin and ProductAdmin
      if (type == 'SaleAdmin' || type == 'ProductAdmin') {
        const supperAdmin = await SupperAdmin.findById(supperAdminID);
        if (!supperAdmin) {
          return res.status(404).json({ error: 'SuperAdmin not found' });
        }
  
        const existingAdmin = type === 'SaleAdmin'
          ? await SaleAdmin.findOne({ mobileNumber })
          : await ProductAdmin.findOne({ mobileNumber });
  
        if (existingAdmin) {
          return res.status(400).json({ error: `${type} with this mobile number already exists` });
        }
  
        const newUser = type === 'SaleAdmin'
          ? new SaleAdmin({ mobileNumber, name, email, type, SupperAdmin: supperAdmin._id })
          : new ProductAdmin({ mobileNumber, name, email, type, SupperAdmin: supperAdmin._id });
  
        await newUser.save();
  
        // Update SupperAdmin to include this new admin
        if (type === 'SaleAdmin') {
          supperAdmin.saleAdmin.push(newUser._id);
        } else {
          supperAdmin.productAdmin.push(newUser._id);
        }
  
        await supperAdmin.save();
  
        return res.status(201).json({ message: `${type} registered successfully`, newUser });
      }
  
      // Logic for handling SaleManager
      if (type === 'SaleManager') {
        const saleAdmin = await SaleAdmin.findById(supperAdminID);  // Assuming supperAdminID is SaleAdmin's ID
        if (!saleAdmin) {
          return res.status(404).json({ error: 'SaleAdmin not found' });
        }
  
        const existingSaleManager = await SaleManager.findOne({ mobileNumber });
        if (existingSaleManager) {
          return res.status(400).json({ error: 'SaleManager with this mobile number already exists' });
        }
  
        const newSaleManager = new SaleManager({
          mobileNumber, name, email, type, SaleAdmin: supperAdminID
        });
  
        await newSaleManager.save();
        saleAdmin.saleManager.push(newSaleManager._id);
        await saleAdmin.save();
  
        return res.status(200).json({ message: 'SaleManager registered successfully', newSaleManager });
      }
  
      return res.status(400).json({ error: 'No matching admin type found' });
  
    } catch (error) {
      console.error('Error in addAdmin:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};
  


//deleteAdmin controller function

const deleteAdmin = async (req, res) => {
    try {
        const { type, id } = req.params;
        console.log(req.params);

        if (type === 'SaleManager') {
            const saleManager = await SaleManager.findOne({ _id: id });
            if (!saleManager) {
                return res.status(404).json({ message: "Sale Manager not found" });
            }

            if (saleManager.SaleAdmin) {
                const saleAdmin = await SaleAdmin.findOne({ _id: saleManager.SaleAdmin });

                if (saleAdmin) {
                    saleAdmin.saleManager.pull(id);
                    await saleAdmin.save();
                }
            }

            await SaleManager.findByIdAndDelete(id);
            return res.status(200).json({ message: "Sale Manager deleted successfully" });
        }

        if (type === 'SaleAdmin') {
            const saleAdmin = await SaleAdmin.findById(id);
            if (!saleAdmin) {
              return res.status(404).json({ message: "Sale Admin not found" });
            }
      
            // Check if this SaleAdmin has saleManagers associated with it
            if (saleAdmin.saleManager && saleAdmin.saleManager.length > 0) {
              // Get the default SaleAdmin (the one without specific saleManagers)
              const defaultSaleAdmin = await SaleAdmin.findOne({ mobileNumber: '1234567890' }); // Default SaleAdmin number
      
              if (!defaultSaleAdmin) {
                return res.status(404).json({ message: "Default Sale Admin not found" });
              }
      
              // Move saleManagers to the default SaleAdmin
              const saleManagersToMove = saleAdmin.saleManager;
      
              // Update saleManagers to point to the default admin
              await SaleManager.updateMany(
                { _id: { $in: saleManagersToMove } },
                { $set: { saleAdmin: defaultSaleAdmin._id } }
              );
      
              // Remove saleManagers from the current SaleAdmin
              await SaleAdmin.findByIdAndUpdate(saleAdmin._id, {
                $pull: { saleManager: { $in: saleManagersToMove } }
              });
      
              // Add saleManagers to the default SaleAdmin
              await SaleAdmin.findByIdAndUpdate(defaultSaleAdmin._id, {
                $push: { saleManager: { $each: saleManagersToMove } }
              });
            }
            // Delete the SaleAdmin after transferring the saleManagers (if any)
            await SaleAdmin.findByIdAndDelete(id);
            return res.status(200).json({ message: "Sale Admin deleted successfully" });
        }

        if (type === 'ProductAdmin') {
            const productAdmin = await ProductAdmin.findById(id);
            if (!productAdmin) {
                return res.status(404).json({ message: "Product Admin not found" });
            }

            // Check if this ProductAdmin has products associated with it
            if (productAdmin.products && productAdmin.products.length > 0) {
                // Get the default ProductAdmin (the one without specific products)
                const defaultProductAdmin = await ProductAdmin.findOne({ mobileNumber: '1234567891' }); // Replace with actual default number if necessary
                if (!defaultProductAdmin) {
                    return res.status(404).json({ message: "Default Product Admin not found" });
                }

                // Move products to the default ProductAdmin
                const productsToMove = productAdmin.products;
                await Product.updateMany(
                    { _id: { $in: productsToMove } },
                    { $set: { productAdmin: defaultProductAdmin._id } }
                );

                // Remove products from the current ProductAdmin
                await ProductAdmin.findByIdAndUpdate(productAdmin._id, {
                    $pull: { products: { $in: productsToMove } }
                });

                // Add products to the default ProductAdmin
                await ProductAdmin.findByIdAndUpdate(defaultProductAdmin._id, {
                    $push: { products: { $each: productsToMove } }
                });
            }

            // Delete the ProductAdmin after transferring the products (if any)
            await ProductAdmin.findByIdAndDelete(id);

            return res.status(200).json({ message: "Product Admin deleted successfully" });
        }

        return res.status(400).json({ message: "Invalid type provided" });

    } catch (error) {
        console.error('Error deleting admin:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Controller function to get users
const users = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            const mobile = "8860721857";
            const defaultSaleNumber = '1234567890';
            const defaultProfuctNumber = '1234567891';

            console.log("Admin not found");

            const newUser = new SupperAdmin({
                mobileNumber: mobile,
                name: "Supper Admin",
                email: "mohityoga.2016@gmail.com"
            });
            
            const newSaleAdmin = new SaleAdmin({
                mobileNumber: defaultSaleNumber,
                name: "Default Sale Admin",
                email: "defaultSale@gmail.com",
                SupperAdmin: newUser._id
            });

            const newProductAdmin = new ProductAdmin({
                mobileNumber: defaultProfuctNumber,
                name: "Default Product Admin",
                email: "defaultProduct@gmail.com",
                SupperAdmin: newUser._id
            });

            newUser.saleAdmin.push(newSaleAdmin._id);
            newUser.productAdmin.push(newProductAdmin._id);
            await newUser.save();
            await newSaleAdmin.save();
            await newProductAdmin.save();

            console.log("Default admins created and linked to SupperAdmin successfully.");

        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

// Controller function to get perticular user
const singleUser = async (req, res) => {
    try {
        console.log(req.params);
        const user = await User.findOne({mobileNumber: req.params.mobile});
        if (user.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users" });
    }
};


// Controller function to send OTP
const sendOtp = async (req, res) => {
    try {
        const { mobileNumber, otp, type } = req.body;
        console.log(req.body);

        // Validation: Check if mobileNumber, otp, and type are provided
        if (!mobileNumber || !otp || !type) {
            return res.status(400).json({ message: "Mobile number, OTP, and type are required." });
        }

        const mobile = "8860721857"; // Static check for a fallback mobile number
        const defaultSaleNumber = '1234567890';
        const defaultProfuctNumber = '1234567891';
        const fetchedUserAdmin = await SupperAdmin.findOne({ mobileNumber });
        console.log(fetchedUserAdmin);

        // Check if the user exists
        if (!fetchedUserAdmin && mobileNumber !== mobile) {
            return res.status(404).json({ message: "User not found" });
        }

        const fetchedUserSaleAdmin = await SaleAdmin.findOne({ mobileNumber });
        const fetchedUserProductAdmin = await ProductAdmin.findOne({ mobileNumber });
        if(fetchedUserSaleAdmin && mobileNumber ===defaultSaleNumber){
            console.log(`mobile number: ${mobileNumber} and it's otp: ${otp}`);
            return res.status(200).json({fetchedUserSaleAdmin});
        }
        if(fetchedUserProductAdmin && mobileNumber ===defaultProfuctNumber){
            console.log(`mobile number: ${mobileNumber} and it's otp: ${otp}`);
            return res.status(200).json({fetchedUserProductAdmin});
        }
        // If any user is found, proceed to send OTP
        if (fetchedUserAdmin || fetchedUserSaleAdmin || fetchedUserProductAdmin) {
            // OTP sending logic based on 'type'
            if (type === 'whatsapp') { // WhatsApp OTP
                const formattedNumber = `+91${mobileNumber}`; // Assuming mobileNumber is a 10-digit number

                const formData = new FormData();
                formData.append("to", formattedNumber);
                formData.append("type", "mediatemplate");
                formData.append("template_name", "logincode");
                formData.append("channel", "whatsapp");
                formData.append("from", "+919810866265"); // Replace with your WhatsApp number
                formData.append("params", otp);
                const imagePath = path.join(__dirname, "/4.jpeg");
                formData.append("media", fs.createReadStream(imagePath));

                try {
                    const response = await axios.post(
                        "https://api.in.kaleyra.io/v1/HXIN1751096165IN/messages",
                        formData,
                        {
                            headers: {
                                ...formData.getHeaders(),
                                "api-key": process.env.KALEYRA_API_KEY || "A17d7d416a4abf01de27c9dc4107272ec", // Replace with your actual API key
                            },
                        }
                    );
                    return res.status(200).json({
                        message: "WhatsApp OTP sent successfully",
                        data: response.data,
                        otp: otp,
                    });
                } catch (error) {
                    console.error("Error sending WhatsApp message: ", error);
                    return res.status(500).json({
                        message: "Failed to send WhatsApp OTP",
                        error: error.response ? error.response.data : error.message,
                    });
                }
            } else if (type === 'voice') { // Voice OTP
                console.log(process.env.SOLUTIONS_INFINI_API_URL);
                try {
                    const response = await axios.get(`${process.env.SOLUTIONS_INFINI_API_URL}`, {
                        params: {
                            api_key: process.env.SOLUTIONS_INFINI_API_KEY, // Ensure this is set in your environment variables
                            method: "dial.click2call",
                            caller: mobileNumber,
                            receiver: "ivr:250142",  // Example IVR receiver number
                            format: "json",
                            meta: JSON.stringify({ OTP: otp }),
                        },
                    });
                    return res.status(200).json({
                        message: "Voice OTP sent successfully",
                        data: response.data,
                        otp: otp,
                    });
                } catch (error) {
                    console.error("Error sending Voice OTP: ", error);
                    return res.status(500).json({
                        message: "Failed to send Voice OTP",
                        error: error.response ? error.response.data : error.message,
                    });
                }
            } else {
                // If type is neither 'whatsapp' nor 'voice'
                return res.status(400).json({ message: "Invalid OTP type. Must be either 'whatsapp' or 'voice'." });
            }
        } else {
            return res.status(404).json({ message: "User not found" });
        }

    } catch (error) {
        console.error("Error sending OTP: ", error);
        return res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};



const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, mobileNumber, type } = req.body;
        let updatedAdmin;
        console.log("mkdsfds", req.body);
        console.log("mkdsfds", req.params);
        // Find and update based on type
        switch(type) {
            case 'SaleAdmin':
                updatedAdmin = await SaleAdmin.findByIdAndUpdate(
                    id,
                    { name, email, mobileNumber },
                    { new: true }
                );

                break;
            case 'ProductAdmin':
                updatedAdmin = await ProductAdmin.findByIdAndUpdate(
                    id,
                    { name, email, mobileNumber },
                    { new: true }
                );
                break;
            case 'SaleManager':
                updatedAdmin =await SaleManager.findByIdAndUpdate(
                    id,
                    {name, email, mobileNumber},
                    {new: true}
                );
                break;
            default:
                return res.status(400).json({ message: "Invalid admin type" });
        }

        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const checkProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await ProductAdmin.findById(id);
        const allProductAdmin = await ProductAdmin.find({type:"ProductAdmin"});
        if (!product.products) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ product: product.products, otherProductAdmin: allProductAdmin.filter((admin)=>admin.id !==id) });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const updateSaleAdmin = async (req, res) => {
    const { type } = req.body;
  
    // Check if the type is either SaleAdmin or ProductAdmin
    if (type !== 'SaleAdmin' && type !== 'ProductAdmin') {
      return res.status(400).json({ error: 'Invalid admin type provided' });
    }
  
    try {
      if (type === 'SaleAdmin') {
        const { saleAdminId, newSaleAdminId } = req.body;
        if (!saleAdminId || !newSaleAdminId) {
          return res.status(400).json({ error: 'Both SaleAdmin and New SaleAdmin ID are required' });
        }
  
        const saleAdmin = await SaleAdmin.findById(saleAdminId);
        if (!saleAdmin) {
          return res.status(404).json({ error: 'SaleAdmin not found' });
        }
  
        const newSaleAdmin = await SaleAdmin.findById(newSaleAdminId);
        console.log(newSaleAdmin);
        if (!newSaleAdmin) {
          return res.status(404).json({ error: 'New SaleAdmin not found' });
        }
  
        const saleManagersToMove = saleAdmin.saleManager;
  
        // Update the SaleAdmin reference for SaleManagers
        await SaleManager.updateMany(
          { _id: { $in: saleManagersToMove } },
          { $set: { SaleAdmin: newSaleAdminId } }
        );
  
        // Remove SaleManagers from the old SaleAdmin and add to the new SaleAdmin
        await SaleAdmin.findByIdAndUpdate(saleAdminId, {
          $pull: { saleManager: { $in: saleManagersToMove } }
        });
        await SaleAdmin.findByIdAndUpdate(newSaleAdminId, {
          $push: { saleManager: { $each: saleManagersToMove } }
        });
  
        // Delete the SaleAdmin after transfer
        await SaleAdmin.findByIdAndDelete(saleAdminId);
  
        return res.status(200).json({ message: 'Sale Managers successfully moved to new SaleAdmin and old SaleAdmin deleted' });
  
      }
  
      if (type === 'ProductAdmin') {
        const { productAdminId, newProductAdminId } = req.body;
        if (!productAdminId || !newProductAdminId) {
          return res.status(400).json({ error: 'Both ProductAdmin and New ProductAdmin ID are required' });
        }
  
        const productAdmin = await ProductAdmin.findById(productAdminId);
        if (!productAdmin) {
          return res.status(404).json({ error: 'ProductAdmin not found' });
        }
  
        const newProductAdmin = await ProductAdmin.findById(newProductAdminId);
        if (!newProductAdmin) {
          return res.status(404).json({ error: 'New ProductAdmin not found' });
        }
  
        // Fetch all products that belong to the current ProductAdmin
        const productsToMove = await Product.find({ productAdmin: productAdminId });
        if (productsToMove.length === 0) {
          return res.status(404).json({ error: 'No products found for this ProductAdmin' });
        }
  
        // Update productAdmin reference for the products
        await Product.updateMany(
          { _id: { $in: productsToMove.map(product => product._id) } },
          { $set: { productAdmin: newProductAdminId } }
        );
  
        // Remove products from the old ProductAdmin and add to the new one
        await ProductAdmin.findByIdAndUpdate(productAdminId, {
          $pull: { products: { $in: productsToMove.map(product => product._id) } }
        });
        await ProductAdmin.findByIdAndUpdate(newProductAdminId, {
          $push: { products: { $each: productsToMove.map(product => product._id) } }
        });
  
        // Delete the ProductAdmin after transfer
        await ProductAdmin.findByIdAndDelete(productAdminId);
  
        return res.status(200).json({ message: 'Products successfully moved to new ProductAdmin and old ProductAdmin deleted' });
      }
  
    } catch (error) {
      console.error('Error in updating admin:', error);
      res.status(500).json({ error: 'An error occurred while updating the admin' });
    }
  };
  
  

// Export the controller functions along with the multer upload middleware
module.exports = { home, register, login, fetchAdmin, users, sendOtp, singleUser, addAdmin, deleteAdmin,updateAdmin,checkProduct,updateSaleAdmin };
