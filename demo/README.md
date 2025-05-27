# Cookie Consent Demo

This demo showcases the Cookie Consent web component in action.

## Quick Start

### Option 1: Run the complete demo (Recommended)
```bash
npm run dev
```

This will:
1. Build the web component from the `../web` folder
2. Copy it to the demo's `dist` folder  
3. Start a local server at http://localhost:3000
4. Open your browser automatically

### Option 2: Manual setup
```bash
# Build the web component first
cd ../web
npm run build

# Then build and serve the demo
cd ../demo
npm run build
npm run serve
```

## Demo Features

The demo includes:

- **Basic Usage Example**: Shows how to include the component with minimal setup
- **Configuration Examples**: Demonstrates various configuration options
- **Interactive Controls**: Buttons to test consent management
- **Real-time Status**: Shows current consent status and changes
- **Script Loading Demo**: Example scripts that load based on consent categories
- **Event Logging**: Live log of consent-related events

## Demo Controls

- **Clear Consent**: Removes all stored consent and reloads the page
- **Show Current Status**: Displays the current consent state
- **Show Consent Dialog**: Forces the consent dialog to appear

## Files

- `index.html` - Basic demo page (uses local cookie-consent.js)
- `index-enhanced.html` - Enhanced demo with more interactive features
- `dist/` - Built demo files (created during build)

## Development

The demo automatically copies the built web component from `../web/dist/cookie-consent.js` to ensure you're always testing the latest version.

**Important**: The demo uses cookies only (not localStorage) for consent storage, exactly as the component is designed to work. This ensures accurate testing of the real behavior.

### How Script Blocking Works

The cookie consent component works by:

1. **Initial State**: Scripts with `type="text/plain"` and `data-consent="category"` are **completely blocked** by the browser
2. **Consent Given**: When user consents, the component finds these scripts and replaces them with executable versions  
3. **Real Execution**: The new scripts execute immediately, demonstrating the actual behavior users will experience

This is different from localStorage-based approaches because:
- ✅ Scripts are truly blocked until consent (not just conditionally executed)
- ✅ No "fake" demonstrations - scripts genuinely don't run without consent  
- ✅ Follows browser security model properly
- ✅ Works exactly like real-world cookie consent implementations

### Script Replacement Process

The component's `enableScriptsBasedOnConsent()` method:
1. Finds all `script[data-consent]` elements with `type="text/plain"`
2. Creates new script elements without the `type="text/plain"` attribute
3. Copies all attributes and content to the new script
4. Replaces the blocked script with the executable one
5. Browser immediately downloads and executes the newly activated script
6. Emits a `scripts-enabled` event with details about which categories were enabled

**No page reload required!** The browser handles script loading dynamically when the DOM is updated.

## Testing Different Scenarios

1. **First Visit**: Clear the `cookie-consent` cookie in your browser's developer tools and reload
2. **Returning User**: Keep the cookie to test the "already consented" flow  
3. **Different Categories**: Test granting/denying specific cookie categories
4. **Browser Console**: Check the console for debug information and script loading logs

### Clearing Consent for Testing
- Use the "Clear Consent" button in the demo
- Or manually delete the `cookie-consent` cookie in DevTools (Application tab > Cookies)
- Or run `document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'` in the console

### Verifying Script Blocking
1. **Before Consent**: Check browser console - no analytics/marketing messages should appear
2. **After Consent**: Scripts execute immediately and log their activation
3. **DevTools Network**: Scripts with `type="text/plain"` are not downloaded until consent
