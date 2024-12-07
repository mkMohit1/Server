// home

const User = require("../models/user-model");
const Blog = require("../models/blog-model");

const home = async(req,res)=>{
    try {
        res.status(200).send("Welcome to the auth router!");
    } catch (error) {
        console.log("error ",error);
    }
}

const register = async (req, res) => {
    console.log("Register Request Body:", req.body);
    try {
        const { userName, mobileNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ mobileNumber });
        if (existingUser) {
            // If user exists, return an error response
            return res.status(400).json({ message: "User already exists" });
        }

        // If no user exists, create a new one
        const newUser = new User({ userName, mobileNumber });
        await newUser.save();

        // Send success response after user is successfully created
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        // Catch any errors and send an error response
        res.status(500).json({ message: "Internal Server Error" });
    }
};


const login = async (req,res) => {
    try {
        console.log(req.body);
        res.status(200).json(req.body);
    } catch (error) { 
        res.status(400).json("internal server error");
    }
}



const users = async (req, res) => {
    try {
        const Users = await User.find();

        if (Users.length === 0) {
            return res.status(404).json({
                message: "No users found. Please add some users.",
            });
        }

        res.status(200).json(Users);
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while fetching users.",
            error: error.message,
        });
    }
};

const sendOtp = async(req,res)=>{
    console.log(req.body);
    try {
            const {mobileNumber, otp}= req.body;
            const Users = await  User.findOne({ mobileNumber });
            if(Users){
                res.status(200).json({
                    mobileNumber,
                    otp
                });
            }
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while fetching users.",
            error: error.message,
        });
    }
}

const addBlog = async(req,res)=>{
    console.log("Register Request Body:", req.body);
    try {
        if(req.body){
            const newBlog = new Blog(req.body);
            await newBlog.save();
             // Send success response after user is successfully created
            res.status(201).json({ message: "new Blog successfully added" });
        }
    } catch (error) {
         // Catch any errors and send an error response
         res.status(500).json({ message: `Internal Server Error: ${error}`});
    }
} 

const Blogs = async(req,res)=>{
    try {
        const Blogs = await Blog.find();
        if (Blogs.length === 0) {
            return res.status(404).json({
                message: "No users found. Please add some users.",
            });
        }

        res.status(200).json(Blogs);
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while fetching users.",
            error: error.message,
        });
    }
}

module.exports = {home, register, login, users,sendOtp, addBlog,Blogs};