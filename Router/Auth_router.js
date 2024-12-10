const express = require('express');
const router = express.Router();
const { home, login, register, users, sendOtp, addBlog, Blogs, fetchBlog, upload,searchBlogs } = require('../controllers/auth_controller');

// Define the routes
router.route('/').get(home);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/send-otp').post(sendOtp);
router.route('/BlogPost').post(upload.single('coverImage'), addBlog); // Handle file upload here
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);
router.route('/blogs/search').get(searchBlogs); // Add route for search functionality

module.exports = router;
