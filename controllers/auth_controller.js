const multer = require('multer');
const path = require('path');
const User = require("../models/commonUser-model");
const supperAdmin = require("../models/supperAdmin-model");
const saleAdmin = require("../models/saleAdmin-model");
const productAdmin = require("../models/productAdmin-model");
const Blog = require("../models/blog-model");
const Contact = require('../models/contact-model');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Define storage configuration for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/'));  // Use absolute path
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));  // Add unique file name
    }
});

// Initialize multer upload
const upload = multer({ storage: storage });

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
        const { mobileNumber } = req.body;
        console.log(req.body);
        const mobile = "8860721857";
        const fetchedUserAdmin = await supperAdmin.findOne({ mobileNumber });
        console.log(fetchedUserAdmin);
        if(!fetchedUserAdmin){
            if(mobileNumber !== mobile) return res.status(404).json({ message: "User not found" });
            else{
                console.log("Admin not found");
                const newUser = new supperAdmin({ mobileNumber:mobile,otp:"1234" });
                await newUser.save();
                res.status(200).json({ message: "User registered successfully" });
            }           
        }
        const fetchedUserSaleAdmin = await saleAdmin.findOne({ mobileNumber });
        const fetchedUserProductAdmin = await productAdmin.findOne({ mobileNumber});
        if (fetchedUserAdmin) {
            res.status(200).json(fetchedUserAdmin);
        }
        else if (fetchedUserSaleAdmin) {
            res.status(200).json(fetchedUserSaleAdmin);
        }
        else if (fetchedUserProductAdmin) {
            res.status(200).json(fetchedUserProductAdmin);
        }   else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(400).json("Internal Server Error");
    }
};


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

        // Find user by mobileNumber
        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
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
                res.status(200).json({
                    message: "WhatsApp OTP sent successfully",
                    data: response.data,
                    otp: otp,
                });
            } catch (error) {
                console.error("Error sending WhatsApp message: ", error);
                res.status(500).json({
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
                res.status(200).json({
                    message: "Voice OTP sent successfully",
                    data: response.data,
                    otp: otp,
                });
            } catch (error) {
                console.error("Error sending Voice OTP: ", error);
                res.status(500).json({
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
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

// Controller function to add a new blog
const addBlog = async (req, res) => {
    try {
        console.log(req.body);
        const newBlog = new Blog(req.body);
        await newBlog.save();
        res.status(201).json({ message: 'New blog successfully added', blog: newBlog });
    } catch (error) {
        res.status(500).json({ message: `Internal Server Error: ${error.message}` });
    }
};

// Controller function to fetch all blogs
const Blogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ date: -1 });
        if (blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found" });
        }
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blogs" });
    }
};

// Controller function to fetch a single blog by ID
const fetchBlog = async (req, res) => {
    try {
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: "Error fetching blog" });
    }
};

const searchBlogs = async (req, res) => {
    try {
        const { query } = req.query; // Extract the query parameter
        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const searchRegex = new RegExp(query, 'i'); // Case-insensitive search
        const blogs = await Blog.find({
            $or: [
                { title: searchRegex },
                { content: searchRegex } // Check if the content contains the query
            ]
        }).sort({ date: -1 }); // Sort by latest date

        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json({ message: "Error searching blogs", error: error.message });
    }
};

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

// Export the controller functions along with the multer upload middleware
module.exports = { home, register, login, fetchAdmin, users, sendOtp, addBlog, Blogs, fetchBlog, upload, searchBlogs,addContact, singleUser };
