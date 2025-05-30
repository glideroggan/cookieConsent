/**
 * Cookie Consent Admin Panel Configuration - GitHub Pages
 * 
 * This configuration is for the GitHub Pages deployment.
 * Update the API URL and API key below to point to your hosted Cookie Consent API server.
 */

window.COOKIE_CONSENT_CONFIG = {
    // 🚨 IMPORTANT: Update this URL to your actual API server
    // Example: 'https://your-api.azurewebsites.net/api/admin'
    // Example: 'https://your-api.herokuapp.com/api/admin'
    // Example: 'https://api.yourdomain.com/api/admin'
    apiUrl: 'https://nyviken.se/consent-api/api/admin',
      // 🔐 IMPORTANT: Set your admin API key here
    // This should match the AdminApiKey in your API server's appsettings.json
    // For production: Use environment variables or secure configuration
    apiKey: 'production-change-me-please',
    
    // For local testing, uncomment these lines:
    // apiUrl: 'http://localhost:5220/api/admin',
    // apiKey: 'dev-admin-key-123'
};

console.log('🍪 Cookie Consent Admin Panel loaded');
console.log('📡 API URL:', window.COOKIE_CONSENT_CONFIG.apiUrl);
