const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        enum: ['registration', 'password-reset'],
        default: 'registration'
    },
    attempts: {
        type: Number,
        default: 0,
        max: 3
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index - auto-delete when expired
    }
}, {
    timestamps: true
});

// Index for efficient queries
otpSchema.index({ email: 1, purpose: 1 });

// Method to check if OTP is expired
otpSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = async function () {
    this.attempts += 1;
    await this.save();
};

// Static method to find valid OTP
otpSchema.statics.findValidOTP = async function (email, purpose = 'registration') {
    return this.findOne({
        email,
        purpose,
        expiresAt: { $gt: new Date() },
        attempts: { $lt: 3 }
    });
};

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
