# Cookie Consent Admin Panel

A standalone administration panel for managing cookie consent configurations.

## Quick Start

1. **Configure API endpoint:**
   Edit `config.js` and update the `apiUrl` to point to your Cookie Consent API server:
   ```javascript
   window.COOKIE_CONSENT_CONFIG = {
       apiUrl: 'https://your-api-server.com/api/admin'
   };
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the admin panel:**
   ```bash
   npm start
   ```

   The admin panel will be available at `http://localhost:3000`

## Deployment

### Static Hosting (Recommended)
Deploy all files to any static hosting service:
- Netlify
- Vercel  
- GitHub Pages
- AWS S3 + CloudFront
- Your web server

### Docker
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

## Configuration

The admin panel connects to your Cookie Consent API server. Make sure to:

1. Update `config.js` with your API server URL
2. Ensure your API server has CORS configured to allow requests from your admin panel domain
3. Verify your API server is running and accessible

## Features

- ✅ **Global Configuration** - Set description, privacy policy URL, and version
- ✅ **Category Management** - Add, edit, and delete cookie categories  
- ✅ **Cookie Details** - Manage individual cookie information
- ✅ **Export Configuration** - Download complete configuration as JSON

## Files

- `index.html` - Main admin panel interface
- `admin.js` - Admin panel functionality
- `admin.css` - Styling
- `config.js` - Configuration (edit this file)
- `package.json` - Package configuration for local development

## API Requirements

This admin panel requires a Cookie Consent API server with the following endpoints:

- `GET /api/admin/global-config` - Get global configuration
- `PUT /api/admin/global-config` - Update global configuration  
- `GET /api/admin/categories` - Get all categories
- `POST /api/admin/categories` - Create new category
- `PUT /api/admin/categories/{id}` - Update category
- `DELETE /api/admin/categories/{id}` - Delete category
- `GET /api/admin/cookie-details` - Get all cookie details
- `POST /api/admin/cookie-details` - Create new cookie detail
- `DELETE /api/admin/cookie-details/{id}` - Delete cookie detail

See the main project documentation for API server setup instructions.
