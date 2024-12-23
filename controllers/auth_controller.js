const User = require("../models/commonUser-model");
const SupperAdmin = require("../models/supperAdmin-model");
const SaleAdmin = require("../models/saleAdmin-model");
const ProductAdmin = require("../models/productAdmin-model");
const path = require('path');
const FormData = require('form-data');
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
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Controller function for user login
const login = async (req, res) => {
    try {
        console.log(req.body);
        res.status(200).json(req.body);
    } catch (error) {
        res.status(400).json("Internal Server Error");
    }
};

// fetchAdmin controller function
const fetchAdmin = async (req, res) => {
    try {
        const { mobileNumber } = req.params;
        console.log(req.params);
		const admin = await SupperAdmin.findOne({ mobileNumber }) 
            || await SaleAdmin.findOne({ mobileNumber }) 
            || await ProductAdmin.findOne({ mobileNumber: mobileNumber });

        if (!admin) {
            return res.status(400).json({ message: "MobileNumber are required" });
        }
        if(admin.isAdmin === 'SupperAdmin'){
			const populatedAdmin  = await admin.populate('saleAdmin').populate('productAdmin');
			const allAdminData = [...populatedAdmin.saleAdmin||[],...populatedAdmin||[]] ;
			return res.status(200).json(allAdminData);
		}
        return res.status(400).json({ message: "Invalid admin type" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// addAdmin controller function
const addAdmin = async (req, res) => {
    try {
        console.log(req.body);
        const { phone, name,email, type, supperAdminID } = req.body;
        const supperAdmin = await SupperAdmin.findOne({ _id:supperAdminID });
        console.log(supperAdmin);
        if(type ==='SaleAdmin'){
            console.log("mk");
        const fetchedUserSaleAdmin = await SaleAdmin.findOne({ mobileNumber:phone });
            if(fetchedUserSaleAdmin){
                return res.status(400).json("User already exists"); 
            }
            console.log("Sale Admin not found and adding new Sale Admin");
            const newUser = new SaleAdmin({ mobileNumber:phone, name,email, type });
              await newUser.save();
              console.log(newUser);
                //add admin to sale collection
                supperAdmin.saleAdmin.push(newUser._id);
				await supperAdmin.save();
                res.status(201).json({ message: "User registered successfully" });
        }
        else if(type ==='ProductAdmin'){
            const fetchedUserProductAdmin = await ProductAdmin.findOne({ mobileNumber: phone });
            if(fetchedUserProductAdmin){
                return res.status(400).json("User already exists"); 
            }
            const newUser = new ProductAdmin({ mobileNumber: phone, name,email, type });
            await newUser.save();
            //add admin to product collection
            supperAdmin.productAdmin.push(newUser._id);
            await supperAdmin.save();
            res.status(201).json({ message: "User registered successfully" });
        }

    } catch (error) {
        res.status(400).json("Internal Server Error");
    }
}   

// Controller function to get users
const users = async (req, res) => {
    try {
        const users = await User.find();
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
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
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};


// Controller function to send OTP
const sendOtp = async (req, res) => {
    try {
        const { mobileNumber, otp, type } = req.body;
        console.log(req.body);

        // Validation: Check if mobileNumber and otp are provided
        if (!mobileNumber || !otp || !type) {
            return res.status(400).json({ message: "Mobile number, OTP, and type are required." });
        }
        const mobile = "8860721857";
        const fetchedUserAdmin = await SupperAdmin.findOne({ mobileNumber });
        console.log(fetchedUserAdmin);
        
        if (!fetchedUserAdmin) {
            if (mobileNumber !== mobile) {
                return res.status(404).json({ message: "User not found" });
            } else {
                console.log("Admin not found");
                const newUser = new SupperAdmin({ mobileNumber: mobile, otp: "1234" });
                await newUser.save();
                return res.status(200).json({ message: "User registered successfully" });
            }
        }

        const fetchedUserSaleAdmin = await SaleAdmin.findOne({ mobileNumber });
        const fetchedUserProductAdmin = await productAdmin.findOne({ mobileNumber });

        if (fetchedUserAdmin) {
            return res.status(200).json(fetchedUserAdmin);  // Return here to stop further execution
        } else if (fetchedUserSaleAdmin) {
            return res.status(200).json(fetchedUserSaleAdmin);  // Return here to stop further execution
        } else if (fetchedUserProductAdmin) {
            return res.status(200).json(fetchedUserProductAdmin);  // Return here to stop further execution
        } else {
            return res.status(404).json({ message: "User not found" });  // Return here to stop further execution
        }

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
            // If type is neither 'whatsapp' nor 'VoiceCall'
            return res.status(400).json({ message: "Invalid OTP type. Must be either 'whatsapp' or 'VoiceCall'." });
        }
    } catch (error) {
        console.error("Error sending OTP: ", error);
        return res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

// Export the controller functions along with the multer upload middleware
module.exports = { home, register, login, fetchAdmin, users, sendOtp, singleUser, addAdmin };
