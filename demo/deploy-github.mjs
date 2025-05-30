#!/usr/bin/env node
/**
 * GitHub Pages Deployment Configuration Script
 * This script configures the admin panel for GitHub Pages deployment
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function deployToGitHub() {
    console.log('🚀 Configuring admin panel for GitHub Pages deployment...');
    
    const docsAdminPath = resolve('../docs/admin');
    
    // Update config.js for production API
    const productionConfig = `/**
 * Cookie Consent Admin Panel Configuration - GitHub Pages
 * 
 * This configuration is for the GitHub Pages deployment.
 * Update the API URL below to point to your hosted Cookie Consent API server.
 */

window.COOKIE_CONSENT_CONFIG = {
    // 🚨 IMPORTANT: Update this URL to your actual API server
    // Example: 'https://your-api.azurewebsites.net/api/admin'
    // Example: 'https://your-api.herokuapp.com/api/admin'
    // Example: 'https://api.yourdomain.com/api/admin'
    apiUrl: 'https://your-api-server.com/api/admin'
    
    // For local testing, uncomment this line:
    // apiUrl: 'http://localhost:5220/api/admin'
};

console.log('🍪 Cookie Consent Admin Panel loaded');
console.log('📡 API URL:', window.COOKIE_CONSENT_CONFIG.apiUrl);
`;
    
    writeFileSync(resolve(docsAdminPath, 'config.js'), productionConfig);
    console.log('✅ Updated config.js for GitHub Pages');
    
    // Add admin navigation to the main demo page
    updateMainDemoPage();
    
    console.log('\n🎉 GitHub Pages deployment ready!');
    console.log('\n📋 Next steps:');
    console.log('1. 🔧 Edit docs/admin/config.js and update the API URL to your hosted server');
    console.log('2. 📤 Commit and push to main branch');
    console.log('3. 🌐 GitHub Pages will serve:');
    console.log('   • Demo: https://yourusername.github.io/cookieConsent/');
    console.log('   • Admin: https://yourusername.github.io/cookieConsent/admin/');
    console.log('4. 🔒 Make sure your API server has CORS configured for GitHub Pages domain');
}

function updateMainDemoPage() {
    const demoIndexPath = resolve('../docs/index.html');
    let demoHtml = readFileSync(demoIndexPath, 'utf8');
    
    // Check if admin link already exists
    if (demoHtml.includes('href="./admin/"')) {
        console.log('ℹ️  Admin link already exists in demo page');
        return;
    }
    
    // Add admin panel link to the hero section
    const adminLinkHtml = `                <a href="./admin/" class="btn btn-secondary">🛠️ Admin Panel</a>`;
    
    // Find the GitHub link and add admin link before it
    const githubLinkPattern = /(\s+<a href="https:\/\/github\.com\/[^"]+")([^>]+>.*?<\/a>)/;
    const match = demoHtml.match(githubLinkPattern);
    
    if (match) {
        const replacement = `${adminLinkHtml}\n${match[0]}`;
        demoHtml = demoHtml.replace(githubLinkPattern, replacement);
        
        writeFileSync(demoIndexPath, demoHtml);
        console.log('✅ Added admin panel link to demo page');
    } else {
        console.log('⚠️  Could not find GitHub link in demo page to insert admin link');
    }
}

// Main execution
try {
    deployToGitHub();
} catch (error) {
    console.error('❌ Failed to configure GitHub deployment:', error.message);
    process.exit(1);
}
