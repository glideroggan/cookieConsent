/**
 * Cookie Consent Admin Panel Configuration - Demo
 * 
 * This configuration is for the local demo.
 * Update the API URL and API key below to point to your Cookie Consent API server.
 */

window.COOKIE_CONSENT_CONFIG = {
    // For local development
    apiUrl: 'http://localhost:5220/api/admin',
    apiKey: 'dev-admin-key-123',
    
    // For production deployment, update these values:
    // apiUrl: 'https://your-api-server.com/api/admin',
    // apiKey: 'your-production-api-key-here'
};

console.log('🍪 Cookie Consent Admin Panel loaded');
console.log('📡 API URL:', window.COOKIE_CONSENT_CONFIG.apiUrl);
console.log('🔐 API Key configured:', !!window.COOKIE_CONSENT_CONFIG.apiKey);
