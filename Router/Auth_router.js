const express = require('express');
const router = express.Router();
const {home, login, register, users, singleUser, sendOtp, addAdmin, fetchAdmin, deleteAdmin,updateAdmin,checkSaleManagers,checkProduct,updateSaleAdmin} = require('../controllers/auth_controller');
const {addBlog, Blogs, fetchBlog, searchBlogs, CoverTopBlog} = require('../controllers/blog_controller');
const {fetchProduct, addProduct,deleteProduct,fetchAllProduct} = require('../controllers/product_controller');
const {addContact} = require('../controllers/contact_controller');

// Define the routes
router.route('/').get(home);
router.route('/login').post(login);
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/user/:mobile').get(singleUser);
router.route('/send-otp').post(sendOtp);

// Blog router//
router.route('/BlogPost').post(addBlog); // Handle file upload here
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);
router.route('/blogs/isOnCoverTop/:id').patch(CoverTopBlog);
router.route('/blogs/search').get(searchBlogs); // Add route for search functionality
// end of Blog router

// router of contact
router.route('/contact').post(addContact);


router.route('/admin/addAdmin').post(addAdmin);
router.route('/admin/getAdmins/:mobileNumber').get(fetchAdmin);
router.route('/admin/deleteAdmin/:type/:id').delete(deleteAdmin);
router.route('/admin/updateAdmin/:id').put(updateAdmin);
router.route('/admin/checkProduct/:id').get(checkProduct);
router.route('/admin/checkSaleManagers/:id').get(checkSaleManagers);
router.route('/admin/updateSaleAdmin').post(updateSaleAdmin);


//router for product
router.route('/admin/addProduct').post(addProduct);
router.route('/admin/deleteProduct').delete(deleteProduct);
router.route('/admin/getProducts/:id').get(fetchProduct);
router.route('/products/allproducts').get(fetchAllProduct);

module.exports = router;
