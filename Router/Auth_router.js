const express = require('express');
const router = express.Router();
const {home, login, register, users, singleUser, sendOtp, addAdmin, fetchAdmin} = require('../controllers/auth_controller');
const {addBlog, Blogs, fetchBlog, searchBlogs} = require('../controllers/blog_controller');
const {addContact} = require('../controllers/contact_controller');

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
router.route('/admin/addAdmin').post(addAdmin);
router.route('/admin/getAdmins/:mobileNumbers').get(fetchAdmin);


module.exports = router;
