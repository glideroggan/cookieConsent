#!/usr/bin/env node
/**
 * Build script for Cookie Consent Admin Panel
 * This script generates both demo and standalone versions from the same source
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Build admin panel for different targets
 * @param {string} target - 'demo' or 'standalone'
 * @param {string} outputDir - Output directory
 */
function buildAdmin(target = 'standalone', outputDir = 'admin-dist') {
    console.log(`🍪 Building ${target} Cookie Consent Admin Panel...`);
    
    const isStandalone = target === 'standalone';
    
    // Read the template admin.html file
    const adminHtmlPath = resolve('admin.html');
    console.log('Reading admin.html from:', adminHtmlPath);
    
    if (!existsSync(adminHtmlPath)) {
        throw new Error(`admin.html not found at ${adminHtmlPath}`);
    }
    
    let adminHtml = readFileSync(adminHtmlPath, 'utf8');    
    // Process HTML based on target
    if (isStandalone) {
        // Remove the "Back to Demo" button for standalone
        adminHtml = adminHtml.replace(
            /<a href="index\.html" class="btn btn-outline">← Back to Demo<\/a>/,
            ''
        );
        
        // Clean up any empty header-actions div if it becomes empty
        adminHtml = adminHtml.replace(
            /<div class="header-actions">\s*<\/div>/,
            ''
        );
        
        // Add config.js include for standalone
        adminHtml = adminHtml.replace(
            '<link rel="stylesheet" href="admin.css">',
            '<link rel="stylesheet" href="admin.css">\n    <script src="config.js"></script>'
        );
    }
    
    // Write the HTML file
    const htmlFileName = isStandalone ? 'index.html' : 'admin.html';
    writeFileSync(resolve(outputDir, htmlFileName), adminHtml);
    console.log(`✅ Generated ${htmlFileName} (${target} version)`);
    
    // Read the original admin.js file
    const adminJsPath = resolve('admin.js');
    let adminJs = readFileSync(adminJsPath, 'utf8');
    
    // Process JS based on target
    if (isStandalone) {
        // Replace hardcoded API URL with configurable one for standalone
        adminJs = adminJs.replace(
            /const API_BASE_URL = 'http:\/\/localhost:5220\/api\/admin';/,
            `// API Configuration - Update this to point to your Cookie Consent API
const API_BASE_URL = window.COOKIE_CONSENT_CONFIG?.apiUrl || 'http://localhost:5220/api/admin';`
        );
    }
    
    // Write the JS file
    writeFileSync(resolve(outputDir, 'admin.js'), adminJs);
    console.log(`✅ Generated admin.js (${target} version)`);
    
    // Copy CSS (same for both targets)
    const adminCssPath = resolve('admin.css');
    const adminCss = readFileSync(adminCssPath, 'utf8');
    writeFileSync(resolve(outputDir, 'admin.css'), adminCss);
    console.log(`✅ Generated admin.css`);
    
    if (isStandalone) {
        // Generate standalone-specific files
        generateStandaloneFiles(outputDir);
    }
    
    console.log(`\n🎉 ${target} admin panel built successfully in ${outputDir}/`);
}

/**
 * Generate files specific to standalone deployment
 */
function generateStandaloneFiles(outputDir) {    const configJs = `/**
 * Cookie Consent Admin Panel Configuration
 * 
 * Update the configuration below to point to your Cookie Consent API server.
 * This file should be loaded before admin.js in your HTML.
 */

window.COOKIE_CONSENT_CONFIG = {
    // Update this URL to point to your Cookie Consent API server
    apiUrl: 'http://localhost:5220/api/admin'
    
    // Example for production:
    // apiUrl: 'https://your-api-server.com/api/admin'
};
`;
    
    writeFileSync(resolve(outputDir, 'config.js'), configJs);
    console.log('✅ Generated config.js (configuration file)');
    
    // Create package.json for the standalone admin
    const standalonePackageJson = {
        name: "cookie-consent-admin",
        version: "1.0.0",
        description: "Standalone Cookie Consent Admin Panel",
        main: "index.html",
        scripts: {
            serve: "npx http-server . -p 3000 -c-1 -o",
            start: "npm run serve"
        },
        devDependencies: {
            "http-server": "^14.1.1"
        },
        keywords: ["cookie", "consent", "gdpr", "admin", "dashboard"],
        author: "",
        license: "MIT"
    };
    
    writeFileSync(
        resolve(outputDir, 'package.json'), 
        JSON.stringify(standalonePackageJson, null, 2)
    );
    console.log('✅ Generated package.json (standalone package configuration)');    
    // Create README for the standalone admin
    const readmeContent = `# Cookie Consent Admin Panel

A standalone administration panel for managing cookie consent configurations.

## Quick Start

1. **Configure API endpoint:**
   Edit \`config.js\` and update the \`apiUrl\` to point to your Cookie Consent API server:
   \`\`\`javascript
   window.COOKIE_CONSENT_CONFIG = {
       apiUrl: 'https://your-api-server.com/api/admin'
   };
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the admin panel:**
   \`\`\`bash
   npm start
   \`\`\`

   The admin panel will be available at \`http://localhost:3000\`

## Deployment

### Static Hosting (Recommended)
Deploy all files to any static hosting service:
- Netlify
- Vercel  
- GitHub Pages
- AWS S3 + CloudFront
- Your web server

### Docker
\`\`\`dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
\`\`\`

## Configuration

The admin panel connects to your Cookie Consent API server. Make sure to:

1. Update \`config.js\` with your API server URL
2. Ensure your API server has CORS configured to allow requests from your admin panel domain
3. Verify your API server is running and accessible

## Features

- ✅ **Global Configuration** - Set description, privacy policy URL, and version
- ✅ **Category Management** - Add, edit, and delete cookie categories  
- ✅ **Cookie Details** - Manage individual cookie information
- ✅ **Export Configuration** - Download complete configuration as JSON

## Files

- \`index.html\` - Main admin panel interface
- \`admin.js\` - Admin panel functionality
- \`admin.css\` - Styling
- \`config.js\` - Configuration (edit this file)
- \`package.json\` - Package configuration for local development

## API Requirements

This admin panel requires a Cookie Consent API server with the following endpoints:

- \`GET /api/admin/global-config\` - Get global configuration
- \`PUT /api/admin/global-config\` - Update global configuration  
- \`GET /api/admin/categories\` - Get all categories
- \`POST /api/admin/categories\` - Create new category
- \`PUT /api/admin/categories/{id}\` - Update category
- \`DELETE /api/admin/categories/{id}\` - Delete category
- \`GET /api/admin/cookie-details\` - Get all cookie details
- \`POST /api/admin/cookie-details\` - Create new cookie detail
- \`DELETE /api/admin/cookie-details/{id}\` - Delete cookie detail

See the main project documentation for API server setup instructions.
`;
    
    writeFileSync(resolve(outputDir, 'README.md'), readmeContent);
    console.log('✅ Generated README.md (deployment documentation)');
}

// Main execution
const target = process.argv[2] || 'standalone';
const outputDir = process.argv[3] || (target === 'demo' ? 'dist' : 'admin-dist');

try {
    buildAdmin(target, outputDir);
    
    if (target === 'standalone') {
        console.log('\n📋 Next steps:');
        console.log('   1. Edit admin-dist/config.js to point to your API server');
        console.log('   2. Deploy the admin-dist/ folder to your hosting service');
        console.log('   3. Or run "yarn serve:admin" to test locally');
    }
    
} catch (error) {
    console.error(`❌ Failed to build ${target} admin panel:`, error.message);
    process.exit(1);
}
