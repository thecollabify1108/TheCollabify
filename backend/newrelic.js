'use strict';

exports.config = {
    /**
     * Array of application names.
     */
    app_name: [process.env.NEW_RELIC_APP_NAME || 'TheCollabify-Backend'],
    /**
     * Your New Relic license key.
     */
    license_key: process.env.NEW_RELIC_LICENSE_KEY,
    logging: {
        /**
         * Level at which to log. 'info' is default, 'debug' is helpful for troubleshooting.
         */
        level: 'info'
    },
    /**
     * When true, all request headers except for those listed in attributes.exclude
     * will be captured for all traces, unless otherwise specified for a tracer.
     */
    allow_all_headers: true,
    attributes: {
        /**
         * Prefix of attributes to exclude from all destinations.
         */
        exclude: [
            'request.headers.cookie',
            'request.headers.authorization',
            'request.headers.proxyAuthorization',
            'request.headers.setCookie*',
            'request.headers.x*',
            'response.headers.cookie',
            'response.headers.authorization',
            'response.headers.proxyAuthorization',
            'response.headers.setCookie*',
            'response.headers.x*'
        ]
    }
};
