import React from 'react';
import { IconPaths } from '../../assets/icons';

const Icon = ({
    name,
    size = 20,
    color = 'currentColor',
    className = '',
    ariaLabel,
    strokeWidth = 2
}) => {
    const iconPath = IconPaths[name];

    if (!iconPath) {
        console.warn(`Icon "${name}" not found in IconPaths`);
        return null;
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline-block align-middle transition-colors ${className}`}
            aria-label={ariaLabel}
            aria-hidden={!ariaLabel}
            role={ariaLabel ? 'img' : 'presentation'}
        >
            {iconPath}
        </svg>
    );
};

export default Icon;
