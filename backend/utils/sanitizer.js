/**
 * Content Sanitizer Utility
 * Removes contact details from messages to prevent platform leakage.
 */

const PATTERNS = {
    // Email: specific enough to avoid false positives, general enough to catch most
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Phone: Matches various international formats, aiming to avoid dates/currency
    // Matches: +1-555-555-5555, 555-555-5555, 123 456 7890
    phone: /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

    // Social Handles: Matches @username (Twitter/IG style)
    // Avoids matching email parts (negative lookbehind/lookahead would be ideal but JS support varies)
    // We'll use a simple approach and rely on email pattern running first or independently
    socialHandle: /(?<!\w)@[\w.]{3,30}\b/g,

    // Keywords: specific phrases indicating external contact
    // Case insensitive flag 'i' will be used in function
    keywords: /\b(whatsapp|telegram|signal|skype|discord|call me|text me|dm me|inbox me)\b/gi
};

const PLACEHOLDER = '[Contact details removed. Continue discussion after acceptance.]';

/**
 * Sanitizes text content by replacing contact details with a placeholder.
 * @param {string} content - The raw message content
 * @returns {string} - The sanitized content
 */
const sanitizeContent = (content) => {
    if (!content) return content;

    let sanitized = content;

    // Replace Phone Numbers
    sanitized = sanitized.replace(PATTERNS.phone, PLACEHOLDER);

    // Replace Emails
    sanitized = sanitized.replace(PATTERNS.email, (match) => {
        // Double check it's not part of a larger harmless string if needed, 
        // but the regex is fairly strict.
        return PLACEHOLDER;
    });

    // Replace Keywords
    sanitized = sanitized.replace(PATTERNS.keywords, PLACEHOLDER);

    // Replace Social Handles
    // We run this last to avoid interfering with email domains if regex logic overlaps,
    // though the email regex consumes the @ usually.
    // Note: This might be aggressive for "@mentioning" features, but for pre-inquiry it's safer.
    // sanitized = sanitized.replace(PATTERNS.socialHandle, PLACEHOLDER); 
    // Re-evaluating Social Handle: @user might be a system user mention. 
    // User requested: "Instagram handles starting with @"
    // Let's only target them if they look external or if we simply ban all @mentions in this phase.
    // To be safe per user request:
    sanitized = sanitized.replace(PATTERNS.socialHandle, (match) => {
        // Optionally checking against known system usernames could happen here, 
        // but for now we bluntly sanitize as requested.
        return PLACEHOLDER;
    });

    return sanitized;
};

module.exports = {
    sanitizeContent,
    PATTERNS // Exporting for testing
};
