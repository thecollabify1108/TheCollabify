const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Configure Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/oauth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, update last login
                    user.lastLogin = new Date();
                    await user.save();
                    return done(null, user);
                }

                // Check if user exists with same email (link accounts)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.authProvider = 'google';
                    user.avatar = profile.photos[0]?.value || user.avatar;
                    user.lastLogin = new Date();
                    await user.save();
                    return done(null, user);
                }

                // New user - store profile data in session for registration completion
                // We'll create the user after they select a role and optionally set a password
                return done(null, {
                    isNewUser: true,
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos[0]?.value || ''
                });

            } catch (error) {
                console.error('Google OAuth error:', error);
                return done(error, null);
            }
        }));

    console.log('✅ Google OAuth configured');
} else {
    console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    if (user.isNewUser) {
        // For new users, serialize the profile data
        done(null, { isNewUser: true, profileData: user });
    } else {
        // For existing users, serialize the user ID
        done(null, user._id);
    }
});

// Deserialize user from session
passport.deserializeUser(async (data, done) => {
    try {
        if (data.isNewUser) {
            // Return the profile data for new users
            done(null, data.profileData);
        } else {
            // Fetch user from database for existing users
            const user = await User.findById(data).select('-password');
            done(null, user);
        }
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
