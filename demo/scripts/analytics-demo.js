// Analytics Demo Script - This file is blocked until analytics consent is given

(function() {
    'use strict';
    
    console.log('🚀 Analytics script activated! This message only appears when consent is granted.');

    // Create analytics tracking object
    window.demoAnalytics = {
        initialized: true,
        track: function(event) {
            console.log('📊 Analytics tracking:', event);
            return 'Analytics data sent';
        }
    };

    // Update demo indicator to show script is now running
    const indicator = document.getElementById('analytics-indicator');
    if (indicator) {
        indicator.className = 'status granted';
        indicator.textContent = '✅ Analytics script loaded and running!';
    }

    // Track a demo page view
    window.demoAnalytics.track({
        event: 'page_view',
        page: 'cookie-consent-demo',
        timestamp: new Date().toISOString()
    });

    // Simulate loading external analytics
    console.log('📈 Would load external analytics library here');
})();
