const multer = require('multer');
const path = require('path');
const User = require("../models/user-model");
const Blog = require("../models/blog-model");

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
        const { mobileNumber, otp } = req.body;
        const user = await User.findOne({ mobileNumber });
        if (user) {
            res.status(200).json({ mobileNumber, otp });
        }
    } catch (error) {
        res.status(500).json({ message: "Error sending OTP" });
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
      const { mobileNumber, email, message, Name } = req.body;
        console.log(req.body);
      // Find the user by ID
      const contactAddInUser = await User.findOne({mobileNumber});
        
      if (!contactAddInUser) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
  
      // Create a new contact
      const newContact = new Contact({
        email,
        message,
        name: Name, // Make sure the property matches
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
module.exports = { home, register, login, users, sendOtp, addBlog, Blogs, fetchBlog, upload, searchBlogs,addContact, singleUser };
