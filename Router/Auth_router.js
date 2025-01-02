const express = require('express');
const router = express.Router();
const multer = require('multer');  // Import multer for file handling
const path = require('path');     // Import path to manage file paths
const passportSetup = require('../config/passport'); // Make sure this is the correct import path

const { register, users, singleUser, sendOtp, addAdmin, fetchAdmin, deleteAdmin, updateAdmin, checkProduct, updateSaleAdmin } = require('../controllers/auth_controller');
const { addBlog, Blogs, fetchBlog, searchBlogs, CoverTopBlog } = require('../controllers/blog_controller');
const { fetchProduct, addProduct, deleteProduct, fetchAllProduct, updateProduct } = require('../controllers/product_controller');
const { addContact } = require('../controllers/contact_controller');
const { addUserAddress } = require('../controllers/customer_controller');

// Multer configuration to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');  // The folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp to avoid name conflicts
  }
});

const upload = multer({ storage: storage });  // Set up multer

// Define the routes
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/user/:mobile').get(singleUser);
router.route('/send-otp').post(sendOtp);

// Blog router
router.route('/BlogPost')
  .post(upload.single('image'), addBlog); // Handle file upload here
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);
router.route('/blogs/isOnCoverTop/:id').patch(CoverTopBlog);
router.route('/blogs/search').get(searchBlogs); // Add route for search functionality
// end of Blog router

// Router for contact
router.route('/contact').post(addContact);

// Admin routes
router.route('/admin/addAdmin').post(addAdmin);
router.route('/admin/getAdmins/:mobileNumber').get(fetchAdmin);
router.route('/admin/deleteAdmin/:type/:id').delete(deleteAdmin);
router.route('/admin/updateAdmin/:id').put(updateAdmin);
router.route('/admin/checkProduct/:id').get(checkProduct);
router.route('/admin/updateSaleAdmin').post(updateSaleAdmin);
router.route('/admin/addNewUser').post(addUserAddress);
// end of Admin routes



// Product routes
router.route('/admin/addProduct')
  .post(upload.single('productImage'), addProduct);  // Handle file upload here
router.route('/admin/deleteProduct/:id').delete(deleteProduct);
router.route('/admin/getProducts/:id').get(fetchProduct);
router.route('/products/allproducts').get(fetchAllProduct);
router.route('/admin/updateProduct/:id').put(upload.single('productImage'),updateProduct);


// for google authentication
router.route('/auth/google').get(passportSetup.authenticate('google', {
  scope: ['profile', 'email']
}));
router.route('/auth/google/callback').get(passportSetup.authenticate('google'), (req, res) => {
  //get the user data
  console.log(req.user);

 // Redirect to the frontend with user information in a query parameter
  res.redirect(`http://localhost:3000?user=${JSON.stringify(req.user)}`);
});


module.exports = router;
