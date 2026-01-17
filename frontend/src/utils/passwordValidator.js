/**
 * Password Strength Validator
 * Returns strength level and feedback messages
 */

export const validatePasswordStrength = (password) => {
    if (!password) {
        return {
            strength: 0,
            level: 'none',
            feedback: []
        };
    }

    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
        strength += 25;
    } else {
        feedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One lowercase letter');
    }

    // Number or special character check
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) {
        strength += 25;
    } else {
        feedback.push('One number or special character');
    }

    // Determine level
    let level = 'weak';
    if (strength >= 75) level = 'strong';
    else if (strength >= 50) level = 'medium';

    return {
        strength,
        level,
        feedback
    };
};

export const getStrengthColor = (level) => {
    switch (level) {
        case 'strong':
            return 'bg-emerald-500';
        case 'medium':
            return 'bg-amber-500';
        case 'weak':
            return 'bg-red-500';
        default:
            return 'bg-dark-600';
    }
};

export const getStrengthText = (level) => {
    switch (level) {
        case 'strong':
            return 'Strong password';
        case 'medium':
            return 'Medium strength';
        case 'weak':
            return 'Weak password';
        default:
            return 'Enter password';
    }
};

export const getStrengthTextColor = (level) => {
    switch (level) {
        case 'strong':
            return 'text-emerald-400';
        case 'medium':
            return 'text-amber-400';
        case 'weak':
            return 'text-red-400';
        default:
            return 'text-dark-500';
    }
};
