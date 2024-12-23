const Blog = require("../models/blog-model");
const axios = require('axios');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

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

// Export the controller functions
module.exports = { addBlog, Blogs, fetchBlog, upload, searchBlogs };