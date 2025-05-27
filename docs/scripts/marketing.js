// Marketing Demo Script - This file is blocked until marketing consent is given
(function() {
    'use strict';
    
    console.log('🎯 Marketing script activated! This message only appears when consent is granted.');

    // Create marketing tracking object
    window.demoMarketing = {
        initialized: true,
        pixel: function(event, data) {
            console.log('📈 Marketing pixel fired:', { event, data });
            
            // Simulate Facebook Pixel tracking
            if (window.fbq) {
                window.fbq('track', event, data);
            }
            
            return 'Marketing pixel fired';
        },
        remarketing: function(audienceId) {
            console.log('🔄 Remarketing tag loaded for audience:', audienceId);
            return 'Remarketing audience updated';
        },
        conversion: function(value, currency = 'USD') {
            console.log('💰 Conversion tracked:', { value, currency });
            return this.pixel('Purchase', { value, currency });
        }
    };

    // Update demo indicator
    const indicator = document.getElementById('marketing-indicator');
    if (indicator) {
        indicator.className = 'status granted';
        indicator.innerHTML = '<span>✅</span> Marketing script loaded and running!';
    }

    // Fire demo marketing events
    window.demoMarketing.pixel('PageView', { page: window.location.pathname });
    window.demoMarketing.remarketing('website-visitors');

    // Log to demo
    if (window.logEvent) {
        window.logEvent('🎯 Marketing script executed successfully');
    }

    // Simulate loading external marketing tools
    console.log('🎯 Marketing tools ready. Would load Facebook Pixel, Google Ads, etc.');
    console.log('🎯 Marketing initialization complete. Available methods:', Object.keys(window.demoMarketing));
})();
