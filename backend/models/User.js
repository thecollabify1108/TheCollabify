const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: function () {
            // Password only required for local auth, not for OAuth
            return this.authProvider === 'local' || !this.authProvider;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password in queries by default
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    role: {
        type: String,
        enum: ['creator', 'seller', 'admin'],
        required: function () {
            // Required if roles array is empty (legacy users)
            return !this.roles || this.roles.length === 0;
        }
    },
    // New multi-role support
    roles: [{
        type: {
            type: String,
            enum: ['creator', 'seller', 'admin'],
            required: true
        },
        password: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    avatar: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Creator'
    },
    pushSubscription: {
        endpoint: String,
        keys: {
            p256dh: String,
            auth: String
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    activeRole: {
        type: String,
        enum: ['creator', 'seller', 'admin']
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Hash legacy password if modified
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Hash role-specific passwords if modified
    if (this.isModified('roles') && this.roles) {
        for (let roleObj of this.roles) {
            // Only hash if password looks unhashed (not starting with $2)
            if (roleObj.password && !roleObj.password.startsWith('$2')) {
                const salt = await bcrypt.genSalt(12);
                roleObj.password = await bcrypt.hash(roleObj.password, salt);
            }
        }
    }

    next();
});

// Compare password method - supports both legacy and role-based passwords
userSchema.methods.comparePassword = async function (candidatePassword, role = null) {
    // If roles array exists and role is specified, compare against role password
    if (this.roles && this.roles.length > 0 && role) {
        const roleObj = this.roles.find(r => r.type === role);
        if (roleObj && roleObj.password) {
            return await bcrypt.compare(candidatePassword, roleObj.password);
        }
    }

    // If roles array exists but no role specified, try all roles
    if (this.roles && this.roles.length > 0 && !role) {
        for (let roleObj of this.roles) {
            const isMatch = await bcrypt.compare(candidatePassword, roleObj.password);
            if (isMatch) {
                return { match: true, role: roleObj.type };
            }
        }
        return { match: false };
    }

    // Legacy: single password comparison
    if (this.password) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    return false;
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

    return resetToken;
};

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
