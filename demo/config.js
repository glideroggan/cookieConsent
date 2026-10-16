/**
 * Cookie Consent Admin Panel Configuration - Demo
 *
 * This configuration is for the local demo. It holds only the API URL:
 * the admin page asks for the admin key at runtime, so no key is stored in this file.
 */

window.COOKIE_CONSENT_CONFIG = {
    // For local development
    apiUrl: 'http://localhost:5220/api/admin',

    // For production deployment, update this value (and connect-src in the CSP meta tag of admin.html):
    // apiUrl: 'https://your-api-server.com/api/admin',
};

console.log('🍪 Cookie Consent Admin Panel loaded');
console.log('📡 API URL:', window.COOKIE_CONSENT_CONFIG.apiUrl);
