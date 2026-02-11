const { sanitizeContent } = require('../utils/sanitizer');

describe('Content Sanitizer', () => {
    const PLACEHOLDER = '[Contact details removed. Continue discussion after acceptance.]';

    test('should pass through safe content unchanged', () => {
        const input = 'Hello, I am interested in your services.';
        expect(sanitizeContent(input)).toBe(input);
    });

    test('should sanitize email addresses', () => {
        const input = 'Contact me at test@example.com for details.';
        const expected = `Contact me at ${PLACEHOLDER} for details.`;
        expect(sanitizeContent(input)).toBe(expected);
    });

    test('should sanitize phone numbers', () => {
        const inputs = [
            'Call me at 555-123-4567',
            'My number is +1 (555) 123-4567',
            'Reach out on 9876543210'
        ];
        inputs.forEach(input => {
            const sanitized = sanitizeContent(input);
            expect(sanitized).toContain(PLACEHOLDER);
            expect(sanitized).not.toMatch(/\d{3}[-.\s]?\d{4}/);
        });
    });

    test('should sanitize social handles', () => {
        const input = 'Check my IG @instastar';
        const expected = `Check my IG ${PLACEHOLDER}`;
        expect(sanitizeContent(input)).toBe(expected);
    });

    test('should sanitize keywords', () => {
        const input = 'Lets chat on WhatsApp or Telegram';
        const sanitized = sanitizeContent(input);
        // Should replace both
        // "Lets chat on [Placeholder] or [Placeholder]"
        const count = (sanitized.match(/\[Contact details removed/g) || []).length;
        expect(count).toBe(2);
    });

    test('should handle mixed content', () => {
        const input = 'Email me at t@t.com or call 555-555-5555. @someuser on telegram.';
        const sanitized = sanitizeContent(input);
        expect(sanitized).not.toContain('t@t.com');
        expect(sanitized).not.toContain('555-555-5555');
        expect(sanitized).not.toContain('@someuser');
        expect(sanitized).not.toContain('telegram');
    });

    test('should handle empty or null input', () => {
        expect(sanitizeContent('')).toBe('');
        expect(sanitizeContent(null)).toBe(null);
    });
});
