import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * OTP Input Component
 * 6-digit OTP input with auto-focus and paste support
 */
const OTPInput = ({ value = ['', '', '', '', '', ''], onChange, onComplete, disabled = false }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-focus first input on mount
        if (inputRefs.current[0] && !disabled) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    useEffect(() => {
        // Check if OTP is complete
        if (value.every(digit => digit !== '') && onComplete) {
            onComplete(value.join(''));
        }
    }, [value, onComplete]);

    const handleChange = (index, newValue) => {
        // Only allow single digit
        const digit = newValue.replace(/[^0-9]/g, '').slice(-1);

        const newOTP = [...value];
        newOTP[index] = digit;
        onChange(newOTP);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, 6);

        if (pastedData.length === 6) {
            const newOTP = pastedData.split('');
            onChange(newOTP);
            inputRefs.current[5]?.focus();
        }
    };

    const handleFocus = (index) => {
        // Select all text on focus for easier editing
        inputRefs.current[index]?.select();
    };

    return (
        <div className="flex gap-2 md:gap-3 justify-center">
            {value.map((digit, index) => (
                <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`
                        w-12 h-14 md:w-14 md:h-16
                        text-center text-2xl md:text-3xl font-bold
                        bg-dark-800 border-2 rounded-xl
                        transition-all duration-200
                        ${digit
                            ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                            : 'border-dark-600 text-dark-200'
                        }
                        ${disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-dark-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                        }
                        focus:outline-none
                    `}
                    whileFocus={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                />
            ))}
        </div>
    );
};

export default OTPInput;
