# GitHub Pages Demo

This directory contains the GitHub Pages demo for the Cookie Consent Component.

## 🌐 Live Demo

Visit the live demo at: `https://[username].github.io/cookieConsent/`

## 📁 Files

- `index.html` - Main demo page with tabbed interface
- `demo.js` - Interactive demo functionality 
- `scripts/` - Demo scripts that get blocked/enabled based on consent
  - `analytics.js` - Analytics demo script
  - `marketing.js` - Marketing demo script  
  - `necessary.js` - Necessary functionality script

## 🚀 Features

The GitHub Pages demo showcases:

### ✨ Interactive Demo
- **Live consent management** - Test the component in real-time
- **Script blocking visualization** - See how scripts are actually blocked
- **Event monitoring** - Real-time event log of consent changes
- **Mobile responsive** - Works on all devices

### 📚 Documentation
- **Installation guides** - Multiple installation methods (npm, CDN)
- **Real-world examples** - Google Analytics, Facebook Pixel, etc.
- **API reference** - Complete component API documentation
- **Code snippets** - Copy-paste ready examples

### 🎮 Interactive Features
- **Tab-based navigation** - Organized content sections
- **Live code examples** - Working demonstrations
- **Network monitoring** - See actual script loading behavior
- **Console integration** - Real browser console output

## 🛠️ Local Development

To test the demo locally:

```bash
# Serve the docs directory
cd docs
python -m http.server 8000
# or
npx http-server . -p 8000

# Open http://localhost:8000
```

## ⚙️ Configuration

The demo uses:
- **Component source**: CDN via unpkg.com
- **API endpoint**: Configurable (defaults to example server)
- **Cookie name**: `demo-consent` 
- **Categories**: `necessary`, `analytics`, `marketing`

## 🔧 Customization

To customize for your own use:

1. **Update API endpoint** in `index.html`:
   ```html
   <cookie-consent api-url="https://your-api.com/consent"></cookie-consent>
   ```

2. **Modify scripts** in the `scripts/` directory to match your tracking needs

3. **Customize styling** by editing the CSS in `index.html`

4. **Add real integrations** by uncommenting and configuring the example integrations

## 📊 Analytics Integration Examples

The demo includes working examples for:

- **Google Analytics 4** - Complete setup with gtag
- **Facebook Pixel** - Full pixel implementation  
- **Google Ads** - Conversion tracking setup
- **Custom Analytics** - Fetch-based tracking example

## 🚦 GitHub Pages Setup

To enable GitHub Pages for your fork:

1. Go to repository Settings
2. Navigate to Pages section  
3. Set Source to "GitHub Actions"
4. The workflow will automatically deploy on push to main

## 🔗 Links

- **npm package**: https://www.npmjs.com/package/@glideroggan/cookie-consent
- **GitHub repository**: https://github.com/glideroggan/cookieConsent
- **Documentation**: See the demo's API Reference tab
