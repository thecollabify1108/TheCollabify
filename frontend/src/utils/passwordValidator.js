/**
 * Password Strength Validator
 * Returns strength level and feedback messages
 */

export const validatePasswordStrength = (password) => {
    if (!password) {
        return {
            strength: 0,
            level: 'none',
            feedback: [],
            isValid: false
        };
    }

    let strength = 0;
    const feedback = [];

    // Length check (min 8)
    const hasLength = password.length >= 8;
    if (hasLength) strength += 25;
    else feedback.push('At least 8 characters');

    // Uppercase check (REQUIRED by backend)
    const hasUppercase = /[A-Z]/.test(password);
    if (hasUppercase) strength += 25;
    else feedback.push('One uppercase letter (A-Z)');

    // Lowercase check
    const hasLowercase = /[a-z]/.test(password);
    if (hasLowercase) strength += 25;
    else feedback.push('One lowercase letter (a-z)');

    // Number check (REQUIRED by backend)
    const hasNumber = /[0-9]/.test(password);
    if (hasNumber) strength += 25;
    else feedback.push('One number (0-9)');

    // All 4 required = strong; 3 = medium; ≤ 2 = weak
    const criteriaMet = [hasLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;
    let level = 'weak';
    if (criteriaMet === 4) level = 'strong';
    else if (criteriaMet >= 3) level = 'medium';

    return {
        strength,
        level,
        feedback,
        isValid: criteriaMet === 4
    };
};

/**
 * Mirrors the backend isStrongPassword check exactly:
 * min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
 */
export const isValidForRegister = (password) => {
    if (!password || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
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
