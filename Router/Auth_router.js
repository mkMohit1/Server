const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const passportSetup = require('../config/passport');
const crypto = require('crypto');

const {
  register,
  login,
  users,
  singleUser,
  sendOtp,
  addAdmin,
  fetchAdmin,
  deleteAdmin,
  updateAdmin,
  checkProduct,
  updateSaleAdmin,
  addCommonUser,
} = require('../controllers/auth_controller');
const {
  addBlog,
  Blogs,
  fetchBlog,
  searchBlogs,
  CoverTopBlog,
} = require('../controllers/blog_controller');
const {
  fetchProduct,
  addProduct,
  deleteProduct,
  fetchAllProduct,
  updateProduct,
  validateCart,
  syncCart,
  deletedCartItem
} = require('../controllers/product_controller');
const { addContact } = require('../controllers/contact_controller');
const { addUserAddress, updateAddress, fetchAddressesByUserId , deleteAddress} = require('../controllers/customer_controller');
const { addSubscription } = require('../controllers/subscription_controller');
const { addConsultation } = require('../controllers/consultation_controller');

// Multer configuration to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Middleware to clear session if user is not found
// router.use((req, res, next) => {
//   const excludedRoutes = ['/auth/logout', '/auth/google', '/auth/google/callback','/products/allproducts','/send-otp','/register/verify','/login'];
//   if (excludedRoutes.includes(req.path)) {
//     return next();
//   }

//   if (!req.user) {
//     console.log('Session cleared as user not found.');
//     req.session.destroy((err) => {
//       if (err) {
//         console.error('Failed to destroy session:', err);
//         return res.status(500).json({ message: 'Failed to clear session' });
//       }
//       res.status(401).json({ message: 'User not authenticated' });
//     });
//   } else {
//     next();
//   }
// });

// Define the routes
router.route('/register').post(register);
router.route('/users').get(users);
router.route('/user/:mobile').get(singleUser);
router.route('/send-otp').post(sendOtp);
router.route('/register/verify').post(register);
router.route('/login').post(login);

// Blog router
router
  .route('/BlogPost')
  .post(upload.single('image'), addBlog);
router.route('/blogs').get(Blogs);
router.route('/blog/:id').get(fetchBlog);
router.route('/blogs/isOnCoverTop/:id').patch(CoverTopBlog);
router.route('/blogs/search').get(searchBlogs);

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
router.route('/commonUser/addNewAddress').post(addUserAddress);
router.route(`/commonUser/updateAddress/:id`).put(updateAddress);
router.route(`/addresses/:userId`).get(fetchAddressesByUserId);
router.route(`/addresses/:id`).delete(deleteAddress);

// Product routes
router
  .route('/admin/addProduct')
  .post(upload.single('productImage'), addProduct);
router.route('/admin/deleteProduct/:id').delete(deleteProduct);
router.route('/admin/getProducts/:id').get(fetchProduct);
router.route('/products/allproducts').get(fetchAllProduct);
router.route('/admin/updateProduct/:id').put(upload.single('productImage'), updateProduct);
router.route('/product/validate-cart').post(validateCart);
router.route('/user/sync-cart').post(syncCart);
router.route('/cart/item').delete(deletedCartItem);

// Generate a 32-byte key
const secretKey = crypto.createHash('sha256').update('manish-secret-key').digest();
const iv = crypto.randomBytes(16);

function encryptData(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
}

// Example usage
router.route('/auth/google/callback').get((req, res, next) => {
  passportSetup.authenticate('google', (err, user, info) => {
    if (err) {
      // Log any internal errors
      console.error('Passport Error:', err);
      return res.redirect(`http://localhost:3000?error=${encodeURIComponent('Authentication failed.')}`);
    }

    if (!user) {
      // Log the info object to check for the error message
      console.log('Passport Info:', info);
      const error = info?.message || 'Authentication failed.';
      return res.redirect(`http://localhost:3000?error=${encodeURIComponent(error)}`);
    }

    // If user exists, log them in and redirect
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login Error:', loginErr);
        return res.redirect(`http://localhost:3000?error=${encodeURIComponent('Login failed.')}`);
      }

      // Encrypt user data and redirect
      const encrypted = encryptData(user);
      res.redirect(`http://localhost:3000?user=${encodeURIComponent(encrypted.encryptedData)}&iv=${encodeURIComponent(encrypted.iv)}`);
    });
  })(req, res, next);
});

// Google authentication route
router.route('/auth/google').get(
  (req, res, next) => {
    // Attach the newUser flag to the session
    req.session.newUser = req.query.newUser === 'true';
    next();
  },
  passportSetup.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account', // Forces account selection even if already logged in
  })
);

// Logout route
router.route('/auth/logout').get((req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ message: 'Failed to logout' });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Failed to clear session' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Successfully logged out' });
    });
  });
});

// subscription route
router.route('/subscribe').post(addSubscription);

// consultation route
router.route('/consultation').post(addConsultation);

module.exports = router;
