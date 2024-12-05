const express = require('express');
const router = express.Router();
const { home, login, register, users } = require('../controllers/auth_controller'); // Import the home controller

// Define the route
router.route('/').get(home);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/users').get(users);

module.exports = router;
