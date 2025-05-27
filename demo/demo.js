// Demo functionality - uses the same cookie mechanism as the component
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
    return el ? el.cookieName : 'cookie-consent';
}

function clearConsent() {
    // Clear the consent cookie
    // TODO: we need to use the name that was used in the cookie consent component
    document.cookie = `${getCookieName()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    location.reload();
}

function showConsentStatus() {
    const consent = getCookieConsent();
    const statusEl = document.getElementById('consent-status');
    
    if (consent) {
        statusEl.className = 'status granted';
        statusEl.innerHTML = `Status: Consent granted<br>Categories: ${JSON.stringify(consent.categories, null, 2)}`;
    } else {
        statusEl.className = 'status pending';
        statusEl.innerHTML = 'Status: No consent given';
    }
}

function triggerConsent() {
    // Use the component's showBanner method to show dialog with current preferences
    const consentComponent = document.querySelector('cookie-consent');
    if (consentComponent && typeof consentComponent.showBanner === 'function') {
        consentComponent.showBanner();
    } else {
        // Fallback: if showBanner isn't available, we need to clear consent to trigger it
        console.warn('showBanner method not available, falling back to consent clearing');
        document.cookie = `${getCookieName()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        location.reload();
    }
}

function toggleAPIError() {
    if (window.MockConsentAPI) {
        if (window.MockConsentAPI.simulateError) {
            window.MockConsentAPI.disableErrorSimulation();
            logEvent('Mock API error simulation disabled');
        } else {
            window.MockConsentAPI.enableErrorSimulation();
            logEvent('Mock API error simulation enabled - reload page to test fallback');
        }
    }
}

function logEvent(message) {
    const logEl = document.getElementById('event-log');
    const time = new Date().toLocaleTimeString();
    logEl.innerHTML += `<div>[${time}] ${message}</div>`;
    logEl.scrollTop = logEl.scrollHeight;
}

// Listen for consent events
document.addEventListener('consent-updated', (event) => {
    logEvent(`Consent updated: ${JSON.stringify(event.detail)}`);
    showConsentStatus();
});

// Listen for scripts being enabled
document.addEventListener('scripts-enabled', (event) => {
    logEvent(`Scripts enabled: ${event.detail.message}`);
    showConsentStatus();
});

// Listen for specific cookie consent component events if they exist
document.addEventListener('consent-changed', (event) => {
    logEvent(`Consent changed: ${JSON.stringify(event.detail)}`);
    showConsentStatus();
});

document.addEventListener('consent-granted', (event) => {
    logEvent(`Consent granted for: ${event.detail.categories ? event.detail.categories.join(', ') : 'all categories'}`);
});

document.addEventListener('consent-denied', (event) => {
    logEvent(`Consent denied for: ${event.detail.categories ? event.detail.categories.join(', ') : 'all categories'}`);
});

// Initialize status on page load
document.addEventListener('DOMContentLoaded', () => {
    showConsentStatus();
    logEvent('Demo page loaded');
});
