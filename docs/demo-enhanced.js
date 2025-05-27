// Enhanced demo functionality for GitHub Pages
function getCookieConsent() {
    const cookieName = getCookieName();
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${cookieName}=`));
    
    if (!cookie) return null;
    
    try {
        return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch {
        return null;
    }
}

function getCookieName() {
    const el = document.querySelector('cookie-consent');
    return el?.getAttribute('cookie-name') || 'cookie-consent';
}

function clearConsent() {
    const cookieName = getCookieName();
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    logEvent('🗑️ Consent cleared - reloading page');
    setTimeout(() => location.reload(), 500);
}

function showConsentStatus() {
    const consent = getCookieConsent();
    const statusEl = document.getElementById('consent-status');
    
    if (consent && consent.categories) {
        const granted = Object.entries(consent.categories).filter(([, value]) => value).map(([key]) => key);
        const denied = Object.entries(consent.categories).filter(([, value]) => !value).map(([key]) => key);
        
        statusEl.className = 'status granted';
        statusEl.innerHTML = `<span>✅</span> Consent Status: Granted for [${granted.join(', ')}]${denied.length ? `, Denied for [${denied.join(', ')}]` : ''}`;
    } else {
        statusEl.className = 'status pending';
        statusEl.innerHTML = '<span>⏳</span> Status: No consent given yet';
    }
    
    updateScriptIndicators();
}

function triggerConsent() {
    const consentComponent = document.querySelector('cookie-consent');
    if (consentComponent && typeof consentComponent.showBanner === 'function') {
        consentComponent.showBanner();
        logEvent('🍪 Consent dialog triggered');
    } else {
        logEvent('⚠️ Cookie consent component not ready yet');
    }
}

function updateScriptIndicators() {
    const consent = getCookieConsent();
    
    // Update analytics indicator
    const analyticsEl = document.getElementById('analytics-indicator');
    if (analyticsEl) {
        if (consent && consent.categories && consent.categories.analytics) {
            analyticsEl.className = 'status granted';
            analyticsEl.innerHTML = '<span>✅</span> Loaded - analytics consent granted';
        } else {
            analyticsEl.className = 'status pending';
            analyticsEl.innerHTML = '<span>⏳</span> Blocked - waiting for analytics consent';
        }
    }
    
    // Update marketing indicator
    const marketingEl = document.getElementById('marketing-indicator');
    if (marketingEl) {
        if (consent && consent.categories && consent.categories.marketing) {
            marketingEl.className = 'status granted';
            marketingEl.innerHTML = '<span>✅</span> Loaded - marketing consent granted';
        } else {
            marketingEl.className = 'status pending';
            marketingEl.innerHTML = '<span>⏳</span> Blocked - waiting for marketing consent';
        }
    }
    
    // Update necessary indicator
    const necessaryEl = document.getElementById('necessary-indicator');
    if (necessaryEl) {
        if (consent && consent.categories && consent.categories.necessary) {
            necessaryEl.className = 'status granted';
            necessaryEl.innerHTML = '<span>✅</span> Loaded - necessary consent granted';
        } else {
            necessaryEl.className = 'status pending';
            necessaryEl.innerHTML = '<span>⏳</span> Blocked - waiting for necessary consent';
        }
    }
}

function logEvent(message) {
    const logEl = document.getElementById('event-log');
    if (!logEl) return;
    
    const time = new Date().toLocaleTimeString();
    const newEntry = document.createElement('div');
    newEntry.innerHTML = `<span style="color: #666;">[${time}]</span> ${message}`;
    
    // Remove the "Waiting for events..." message if it exists
    if (logEl.innerHTML.includes('Waiting for events...')) {
        logEl.innerHTML = '<strong>Event Log:</strong><br>';
    }
    
    logEl.appendChild(newEntry);
    logEl.scrollTop = logEl.scrollHeight;
}

// Event listeners for cookie consent events
document.addEventListener('consent-updated', (event) => {
    logEvent(`🔄 Consent updated: ${JSON.stringify(event.detail)}`);
    showConsentStatus();
});

document.addEventListener('scripts-enabled', (event) => {
    logEvent(`🚀 Scripts enabled: ${event.detail.message || 'Scripts have been activated'}`);
    updateScriptIndicators();
});

document.addEventListener('consent-changed', (event) => {
    logEvent(`📝 Consent changed: ${JSON.stringify(event.detail)}`);
    showConsentStatus();
    updateScriptIndicators();
});

document.addEventListener('consent-granted', (event) => {
    const categories = event.detail?.categories || [];
    if (categories.length > 0) {
        logEvent(`✅ Consent granted for: ${categories.join(', ')}`);
    } else {
        logEvent(`✅ Consent granted`);
    }
    updateScriptIndicators();
});

document.addEventListener('consent-denied', (event) => {
    const categories = event.detail?.categories || [];
    if (categories.length > 0) {
        logEvent(`❌ Consent denied for: ${categories.join(', ')}`);
    } else {
        logEvent(`❌ Consent denied`);
    }
    updateScriptIndicators();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    logEvent('🎮 Demo page loaded - initializing...');
    
    // Initial status check after a delay to allow component to initialize
    setTimeout(() => {
        showConsentStatus();
        const consent = getCookieConsent();
        if (consent) {
            logEvent('🔍 Found existing consent preferences');
        } else {
            logEvent('💡 No existing consent found - dialog should appear');
        }
    }, 1000);
});

// Listen for component ready event
document.addEventListener('DOMContentLoaded', () => {
    const component = document.querySelector('cookie-consent');
    if (component) {
        component.addEventListener('ready', () => {
            logEvent('🚀 Cookie consent component is ready');
        });
    }
});

// Global error handler for demo
window.addEventListener('error', (event) => {
    logEvent(`❌ Error: ${event.error?.message || event.message}`);
});

// Export functions for global access
window.clearConsent = clearConsent;
window.showConsentStatus = showConsentStatus;
window.triggerConsent = triggerConsent;
