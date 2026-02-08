import DOMPurify from 'isomorphic-dompurify';
import PropTypes from 'prop-types';

/**
 * SanitizedHTML Component
 * 
 * Safely renders HTML content by sanitizing it with DOMPurify before finding
 * it into the DOM. This protects against XSS attacks.
 * 
 * Usage:
 * <SanitizedHTML html={unsafeContent} className="prose" />
 */
const SanitizedHTML = ({ html, className = '', tag = 'div' }) => {
    // Sanitize the content
    const cleanHTML = DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true }, // Only allow safe HTML
        ADD_ATTR: ['target'], // Allow target="_blank" for links
    });

    const CustomTag = tag;

    return (
        <CustomTag
            className={className}
            dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
    );
};

SanitizedHTML.propTypes = {
    html: PropTypes.string.isRequired,
    className: PropTypes.string,
    tag: PropTypes.string
};

export default SanitizedHTML;
