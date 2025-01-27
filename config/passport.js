const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();
let error;

passport.use(
  new googleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      passReqToCallback: true, // Allows us to pass the req object to the callback
    },
    async (req,accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const isNewUser = req.session.newUser;
        console.log("newuser",req.session);
        // Check if a user with this email and loginWith='google' exists
        let user = await User.findOne({ email, loginWith: 'google' }).populate({
          path: 'cart.productId',
          model: 'Product',
        });
        if (user) {
          if (isNewUser) {
            // User exists but is trying to register
            error = 'User already exists. Please log in instead.';
            console.log("error",error);
            return done(null, false, { message: error });
          }
          return done(null, user);
        }

        // Check for email conflicts with other login methods
        // user = await User.findOne({ email });
        if (user) {
          error = `A user with this email exists but is registered with ${user.loginWith}. Please log in using the correct method.`;
          console.log("error",error);
          return done(null, false, { message: error });
        }

        if (!isNewUser) {
          // User does not exist and is trying to log in
          error = 'No account found. Please register first.';
          console.log("error",error);
          return done(null, false, { message: error });
        }
        // Create a new user with loginWith='google'
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          userImage: profile.photos[0].value,
          loginWith: 'google',
        });
        await user.save();
        done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
    console.log('Serializing User:', user); // Debug log
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      // console.log('Deserializing User ID:', id); // Debug log
      // Fetch the user and populate the cart's product details
      const user = await User.findById(id).populate({
        path: 'cart.productId',
        model: 'Product',
      });
      console.log("des", user.cart);
      if (!user) {
        console.error(`User not found for ID: ${id}. Clearing session.`);
        return done(null, false); // Pass `false` to clear the session
      }
      // console.log('User Found:', user); // Debug log
      done(null, user);
    } catch (error) {
      console.error('Error in deserialization:', error); // Log any errors
      done(error, null);
    }
  });
  
  

module.exports = passport;
