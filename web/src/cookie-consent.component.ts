import { getConsentTemplate } from './cookie-consent.template';
import { getConsentStyles } from './cookie-consent.styles';

export interface ConsentConfig {
    apiUrl?: string;
    cookieName?: string;
    categories?: ConsentCategory[];
}

interface ApiResponse {
    version: string;
    description?: string;
    categories: ConsentCategory[];
}

export interface ConsentCategory {
    id: string;
    name: string;
    description: string;
    required: boolean;
    enabled: boolean;
}

export interface ConsentData {
    version: string;
    categories: Record<string, boolean>;
}

export class CookieConsentComponent extends HTMLElement {
    private config: ConsentConfig = {
        apiUrl: '',
        cookieName: 'cookie-consent',
        categories: [
            // Default fallback categories if API is not available
            { id: 'necessary', name: 'Necessary', description: 'Required for basic site functionality', required: true, enabled: true },
            { id: 'analytics', name: 'Analytics', description: 'Help us understand how you use our site', required: false, enabled: false },
            { id: 'marketing', name: 'Marketing', description: 'Used to deliver relevant ads', required: false, enabled: false }
        ],
    }; private shadow: ShadowRoot;
    private apiData: ApiResponse | null = null;
    private originalBodyOverflow: string = '';
    private originalBodyPaddingRight: string = '';
    private isScrollLocked: boolean = false;

    public get cookieName(): string {
        return this.config.cookieName || 'cookie-consent';
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.updateConfig();
        this.checkConsent();
    }

    disconnectedCallback() {
        // Ensure scroll is unlocked if component is removed while dialog is open
        this.unlockBodyScroll();
    }

    private updateConfig() {
        // Read configuration from attributes
        const apiUrl = this.getAttribute('api-url');
        if (apiUrl) this.config.apiUrl = apiUrl;

        const cookieName = this.getAttribute('cookie-name');
        if (cookieName) this.config.cookieName = cookieName;
    }

    private async checkConsent() {
        try {
            // TODO: first, do we have a cookie?
            const localConsent = this.getLocalConsent();
            this.apiData = await this.fetchApiConsent();
            this.config.categories = this.apiData?.categories || this.config.categories; if (this.apiData && localConsent) {
                if (this.isConsentOutdated(localConsent, this.apiData)) {
                    this.showConsentBanner();
                    return;
                }
                this.enableScriptsBasedOnConsent();
            } else if (!localConsent) {
                this.showConsentBanner();
            } else {
                this.enableScriptsBasedOnConsent();
            }
        } catch (error) {
            console.warn('Cookie consent API error:', error);
            // Fallback to local consent only
            const localConsent = this.getLocalConsent();
            if (!localConsent) {
                this.showConsentBanner();
            } else {
                this.enableScriptsBasedOnConsent();
            }
        }
    }
    
    private async fetchApiConsent(): Promise<ApiResponse> {
        if (!this.config.apiUrl) throw new Error('No API URL configured');
        const response = await fetch(`${this.config.apiUrl}/consent`);
        if (!response.ok) throw new Error('API request failed');
        return await response.json() as ApiResponse;
    }
    
    private getLocalConsent(): ConsentData | null {
        const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${this.config.cookieName}=`));

        if (!cookie) return null;

        try {
            return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        } catch {
            return null;
        }
    }

    private isConsentOutdated(local: ConsentData, api: any): boolean {
        return api.version && local.version !== api.version;
    }
    
    private lockBodyScroll() {
        if (this.isScrollLocked) return; // Already locked

        // Store original styles
        this.originalBodyOverflow = document.body.style.overflow;
        this.originalBodyPaddingRight = document.body.style.paddingRight;

        // Calculate scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Apply scroll lock
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        // Add keyboard event listener to prevent scroll-related keys
        document.addEventListener('keydown', this.handleKeyDown, true);

        this.isScrollLocked = true;
    }
    private unlockBodyScroll() {
        // Restore original styles
        document.body.style.overflow = this.originalBodyOverflow;
        document.body.style.paddingRight = this.originalBodyPaddingRight;

        // Remove keyboard event listener
        document.removeEventListener('keydown', this.handleKeyDown, true);

        // Reset the scroll lock state
        this.isScrollLocked = false;
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        // Prevent scroll-related keys when dialog is open
        const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];

        if (scrollKeys.includes(event.key)) {
            // Only prevent if the target is not within our dialog
            const dialog = this.shadow.getElementById('consent-dialog');
            if (dialog && !dialog.contains(event.target as Node)) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
    }

    private showConsentBanner() {
        // Apply existing consent data to categories before rendering
        const existingConsent = this.getLocalConsent(); const isAnUpdatedVersion = this.apiData && existingConsent && this.isConsentOutdated(existingConsent, this.apiData);

        if (isAnUpdatedVersion) {
            this.config.categories = this.apiData!.categories;
        }

        const categoriesToRender = (this.config.categories || []).map(category => ({
            ...category,
            enabled: existingConsent ?
                (existingConsent.categories[category.id] ?? category.enabled) :
                category.enabled
        }));

        const template = getConsentTemplate(categoriesToRender, this.apiData?.description);
        const styles = getConsentStyles();

        this.shadow.innerHTML = `
            <style>${styles}</style>
            ${template}
        `;

        this.attachEventListeners();        // Lock body scroll before showing dialog
        this.lockBodyScroll();

        // Show the dialog as modal
        const dialog = this.shadow.getElementById('consent-dialog') as HTMLDialogElement;
        if (dialog) {
            dialog.showModal();
        }
    } private attachEventListeners() {
        const acceptBtn = this.shadow.getElementById('accept-btn');
        const declineBtn = this.shadow.getElementById('decline-btn');
        const saveBtn = this.shadow.getElementById('save-btn');
        const dialog = this.shadow.getElementById('consent-dialog') as HTMLDialogElement;

        acceptBtn?.addEventListener('click', () => this.acceptAll());
        declineBtn?.addEventListener('click', () => this.declineAll());
        saveBtn?.addEventListener('click', () => this.savePreferences());

        // Handle dialog close event (includes ESC key press)
        dialog?.addEventListener('close', () => {
            // Unlock body scroll when dialog is closed by any means (including ESC)
            this.unlockBodyScroll();
            this.style.display = 'none';
        });
    }

    private acceptAll() {
        const consent: ConsentData = {
            version: this.apiData?.version || '1.0',
            categories: {}
        };

        this.config.categories?.forEach(category => {
            consent.categories[category.id] = true;
        });

        this.saveConsent(consent);
        this.enableScriptsBasedOnConsent();
        this.hideBanner();
    }

    private declineAll() {
        const consent: ConsentData = {
            version: this.apiData?.version || '1.0',
            categories: {}
        };

        this.config.categories?.forEach(category => {
            consent.categories[category.id] = category.required;
        });

        this.saveConsent(consent);
        this.enableScriptsBasedOnConsent();
        this.hideBanner();
    }

    private savePreferences() {
        const consent: ConsentData = {
            version: this.apiData?.version || '1.0',
            categories: {}
        };

        this.config.categories?.forEach(category => {
            const toggle = this.shadow.getElementById(`toggle-${category.id}`) as HTMLInputElement;
            consent.categories[category.id] = toggle?.checked || category.required;
        });

        this.saveConsent(consent);
        this.enableScriptsBasedOnConsent();
        this.hideBanner();
    }

    private saveConsent(consent: ConsentData) {
        const cookieValue = encodeURIComponent(JSON.stringify(consent));
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1); document.cookie = `${this.config.cookieName}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('consent-updated', { detail: consent, bubbles: true, composed: true }));
    }

    private enableScriptsBasedOnConsent() {
        const consent = this.getLocalConsent();
        if (!consent) return;

        // Find all script tags with data-consent attribute that need to be enabled
        const scripts = document.querySelectorAll('script[data-consent]');
        const enabledCategories: string[] = [];

        scripts.forEach(script => {
            const category = script.getAttribute('data-consent');
            if (category && consent.categories[category] && script.getAttribute('type') === 'text/plain') {
                // Enable the script by changing type from text/plain to executable
                const newScript = document.createElement('script');

                // Copy all attributes except type
                Array.from(script.attributes).forEach(attr => {
                    if (attr.name !== 'type') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                });

                // Copy content
                newScript.textContent = script.textContent;

                // Replace the script - browser will immediately execute it
                script.parentNode?.replaceChild(newScript, script);

                // Track which categories were enabled
                if (!enabledCategories.includes(category)) {
                    enabledCategories.push(category);
                }
            }
        });

        // Emit event to inform about enabled scripts
        if (enabledCategories.length > 0) {
            this.dispatchEvent(new CustomEvent('scripts-enabled', {
                detail: {
                    consent,
                    enabledCategories,
                    message: `Scripts enabled for categories: ${enabledCategories.join(', ')}`
                }
            }));
        }
    } private hideBanner() {
        const dialog = this.shadow.getElementById('consent-dialog') as HTMLDialogElement;
        if (dialog && dialog.open) {
            dialog.close(); // This will trigger the 'close' event listener which handles cleanup
        } else {
            // If dialog is not open (edge case), ensure cleanup happens
            this.unlockBodyScroll();
            this.style.display = 'none';
        }
    }
    // Public methods for programmatic control
    public showBanner() {
        this.style.display = 'block';
        this.showConsentBanner();
    }

    public getConsent(): ConsentData | null {
        return this.getLocalConsent();
    }

    public resetConsent() {
        document.cookie = `${this.config.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        this.checkConsent();
    }

    public enableScripts() {
        const consent = this.getLocalConsent();
        if (!consent) return;

        // Find all script tags with data-consent attribute
        const scripts = document.querySelectorAll('script[data-consent]');

        scripts.forEach(script => {
            const category = script.getAttribute('data-consent');
            if (category && consent.categories[category]) {
                // Enable the script by changing type from text/plain to text/javascript
                if (script.getAttribute('type') === 'text/plain') {
                    const newScript = document.createElement('script');

                    // Copy all attributes except type
                    Array.from(script.attributes).forEach(attr => {
                        if (attr.name !== 'type') {
                            newScript.setAttribute(attr.name, attr.value);
                        }
                    });

                    // Copy content
                    newScript.textContent = script.textContent;

                    // Replace the script
                    script.parentNode?.replaceChild(newScript, script);
                }
            }
        });
    }
}

// Register the custom element
customElements.define('cookie-consent', CookieConsentComponent);
