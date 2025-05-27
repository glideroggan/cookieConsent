# Cookie Consent Component

A vanilla TypeScript web component for GDPR-compliant cookie consent management.

## Installation

```bash
npm install @glideroggan/cookie-consent
# or
yarn add @glideroggan/cookie-consent
```

## Usage

### Via CDN (ESM)
```html
<script type="module" src="https://unpkg.com/@glideroggan/cookie-consent/dist/cookie-consent.esm.js"></script>
<cookie-consent api-url="https://your-api.com/consent" cookie-name="my-consent"></cookie-consent>
```

### Via CDN (Script tag)
```html
<script src="https://unpkg.com/@glideroggan/cookie-consent/dist/cookie-consent.js"></script>
<cookie-consent api-url="https://your-api.com/consent" cookie-name="my-consent"></cookie-consent>
```

### With bundler
```javascript
import '@glideroggan/cookie-consent';
```

## API

The component expects a consent API endpoint that returns:
```json
{
  "version": "1.3",
  "categories": [
    {
      "id": "necessary",
      "name": "Necessary",
      "description": "Required for basic site functionality", 
      "required": true,
      "enabled": true
    }
  ]
}
```

## Attributes

- `api-url`: URL to your consent configuration endpoint
- `cookie-name`: Name of the cookie to store consent preferences