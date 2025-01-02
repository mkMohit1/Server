const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const User = require('../models/commonUser-model');

dotenv.config();

// set the passport strategy using the google strategy
passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if the user already exists
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            }
            // Create a new user if not found
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                userImage: profile.photos[0].value
            });
            await user.save();
            done(null, user);
        } catch (error) {
            console.error(error);
            done(error, null);
        }
    }   
));


// passport serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            return done(new Error('User not found'), null);
        }
        done(null, user);
    } catch (error) {
        console.error(error);
        done(error, null);
    }
});


module.exports = passport;