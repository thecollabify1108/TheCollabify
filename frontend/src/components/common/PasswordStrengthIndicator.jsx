import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    validatePasswordStrength,
    getStrengthColor,
    getStrengthText,
    getStrengthTextColor
} from '../../utils/passwordValidator';

/**
 * PasswordStrengthIndicator - Visual password strength meter
 * @param {string} password - Password to validate
 * @param {boolean} showFeedback - Whether to show improvement suggestions
 */
const PasswordStrengthIndicator = ({ password, showFeedback = true }) => {
    const [validation, setValidation] = useState({
        strength: 0,
        level: 'none',
        feedback: []
    });

    useEffect(() => {
        const result = validatePasswordStrength(password);
        setValidation(result);
    }, [password]);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${getStrengthColor(validation.level)} transition-all duration-300`}
                        initial={{ width: 0 }}
                        animate={{ width: `${validation.strength}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <span className={`text-xs font-medium ${getStrengthTextColor(validation.level)}`}>
                    {getStrengthText(validation.level)}
                </span>
            </div>

            {/* Feedback Messages */}
            {showFeedback && validation.feedback.length > 0 && validation.level !== 'strong' && (
                <div className="text-xs text-dark-400 space-y-1">
                    <div className="font-medium">To improve:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                        {validation.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Success Message */}
            {validation.level === 'strong' && (
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Great! Your password is strong
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator;
