// Necessary Demo Script - This runs when necessary consent is given (usually immediately)

(function() {
    'use strict';
    
    console.log('⚙️ Necessary script activated! Essential for site functionality.');

    // Create necessary functionality object
    window.demoNecessary = {
        initialized: true,
        essentialFunction: function() {
            console.log('🔧 Essential site functionality running');
            return 'Site functions properly';
        }
    };

    // Update demo indicator
    const indicator = document.getElementById('necessary-indicator');
    if (indicator) {
        indicator.className = 'status granted';
        indicator.textContent = '✅ Necessary script loaded (required for site function)';
    }

    // Run essential functions
    window.demoNecessary.essentialFunction();
})();
