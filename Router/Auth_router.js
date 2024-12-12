const express = require('express');
const router = express.Router();
const { home, login, register, users, sendOtp, addBlog, Blogs, fetchBlog, upload, searchBlogs, addContact,singleUser } = require('../controllers/auth_controller');

// Define the routes
router.route('/').get(home);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/user/:mobile').get(singleUser);
router.route('/send-otp').post(sendOtp);
router.route('/BlogPost').post(addBlog); // Handle file upload here
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);
router.route('/blogs/search').get(searchBlogs); // Add route for search functionality
router.route('/contact').post(addContact);

module.exports = router;
