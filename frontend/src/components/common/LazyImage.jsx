import { useEffect, useRef, useState } from 'react';

/**
 * LazyImage - Optimized image component with lazy loading
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {string} placeholder - Placeholder image (low quality)
 */
const LazyImage = ({ src, alt, className = '', placeholder = '/placeholder.png' }) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let observer;

        if (imageRef && imageSrc === placeholder) {
            observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        // Load image when it's about to enter viewport
                        if (entry.isIntersecting) {
                            setImageSrc(src);
                            observer.unobserve(imageRef);
                        }
                    });
                },
                {
                    rootMargin: '50px' // Start loading 50px before entering viewport
                }
            );

            observer.observe(imageRef);
        }

        return () => {
            if (observer && imageRef) {
                observer.unobserve(imageRef);
            }
        };
    }, [imageRef, imageSrc, src, placeholder]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsLoaded(true)}
        />
    );
};

export default LazyImage;
