const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const prisma = require('./prisma');

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
                let user = await prisma.user.findUnique({
                    where: { googleId: profile.id }
                });

                if (user) {
                    // User exists, update last login
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() }
                    });
                    return done(null, user);
                }

                // Check if user exists with same email (link accounts)
                user = await prisma.user.findUnique({
                    where: { email: profile.emails[0].value }
                });

                if (user) {
                    // Link Google account to existing user
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            googleId: profile.id,
                            authProvider: 'GOOGLE',
                            avatar: profile.photos[0]?.value || user.avatar,
                            lastLogin: new Date()
                        }
                    });
                    return done(null, user);
                }

                // New user - store profile data in session for registration completion
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
        done(null, user.id);
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
            const user = await prisma.user.findUnique({
                where: { id: data },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    isActive: true
                }
            });
            done(null, user);
        }
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
