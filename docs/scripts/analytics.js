// Analytics Demo Script - This file is blocked until analytics consent is given
(function() {
    'use strict';
    
    console.log('📊 Analytics script activated! This message only appears when consent is granted.');

    // Create analytics tracking object
    window.demoAnalytics = {
        initialized: true,
        track: function(event, data) {
            console.log('📈 Analytics tracking:', { event, data });
            
            // Simulate sending data to analytics service
            if (window.gtag) {
                window.gtag('event', event, data);
            }
            
            return 'Analytics data logged';
        },
        pageView: function(page) {
            console.log('📄 Page view tracked:', page);
            return this.track('page_view', { page });
        }
    };

    // Update demo indicator
    const indicator = document.getElementById('analytics-indicator');
    if (indicator) {
        indicator.className = 'status granted';
        indicator.innerHTML = '<span>✅</span> Analytics script loaded and running!';
    }

    // Track demo page view
    window.demoAnalytics.pageView(window.location.pathname);
    window.demoAnalytics.track('demo_interaction', { 
        component: 'cookie-consent',
        action: 'analytics_enabled',
        timestamp: new Date().toISOString()
    });

    // Log to demo
    if (window.logEvent) {
        window.logEvent('📊 Analytics script executed successfully');
    }

    console.log('📊 Analytics initialization complete. Available methods:', Object.keys(window.demoAnalytics));
})();
