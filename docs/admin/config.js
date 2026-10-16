/**
 * Cookie Consent Admin Panel Configuration - GitHub Pages
 *
 * This configuration is for the GitHub Pages deployment.
 * It holds only the API URL: the admin key is never stored here (this file is public).
 * The admin page asks for the key at runtime and keeps it for the browser tab only.
 * If you change the API host, update connect-src in the CSP meta tag of index.html too.
 */

window.COOKIE_CONSENT_CONFIG = {
    apiUrl: 'https://nyviken.se/consent-api/api/admin'

    // For local testing:
    // apiUrl: 'http://localhost:5220/api/admin'
};

console.log('🍪 Cookie Consent Admin Panel loaded');
console.log('📡 API URL:', window.COOKIE_CONSENT_CONFIG.apiUrl);
