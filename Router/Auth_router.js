const express = require('express');
const router = express.Router();
const { home, login, register, users,sendOtp,addBlog, Blogs,fetchBlog} = require('../controllers/auth_controller'); // Import the home controller

// Define the route
router.route('/').get(home);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/send-otp').post(sendOtp);
// router.route('/admin-panel').post();
router.route('/BlogPost').post(addBlog);
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);

module.exports = router;
