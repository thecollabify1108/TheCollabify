import React from 'react';

/**
 * LoadingButton - Reusable button with built-in loading state
 * Prevents double-clicks and provides visual feedback during async operations
 */

const LoadingButton = ({
    children,
    loading = false,
    disabled = false,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    fullWidth = false,
    icon: Icon = null,
    loadingText = null,
    ...props
}) => {
    const baseClasses = 'btn transition-all duration-200 flex items-center justify-center gap-2';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        outline: 'border-2 border-primary hover:bg-primary/10',
    };

    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = (disabled || loading) ? 'opacity-60 cursor-not-allowed' : '';

    return (
        <button
            type={type}
            onClick={loading ? undefined : onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
            {...props}
        >
            {loading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    <span>{loadingText || children}</span>
                </>
            ) : (
                <>
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default LoadingButton;
