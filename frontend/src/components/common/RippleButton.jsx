import { useState } from 'react';

const RippleButton = ({
    children,
    onClick,
    className = '',
    type = 'button',
    disabled = false,
    ...props
}) => {
    const [ripples, setRipples] = useState([]);

    const createRipple = (event) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const newRipple = {
            x,
            y,
            size,
            id: Date.now()
        };

        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
        }, 600);
    };

    const handleClick = (event) => {
        createRipple(event);
        if (onClick) {
            onClick(event);
        }
    };

    return (
        <button
            type={type}
            className={`btn-ripple ${className}`}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            {children}
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        width: ripple.size,
                        height: ripple.size
                    }}
                />
            ))}
        </button>
    );
};

export default RippleButton;
