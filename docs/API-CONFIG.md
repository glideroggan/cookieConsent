# API Configuration for GitHub Pages Demo

## Current Status
- **Demo URL**: https://glideroggan.github.io/cookieConsent/
- **API Status**: ⚠️ Using fallback mode (no API connected)
- **Component Source**: CDN via unpkg.com/@glideroggan/cookie-consent

## To Connect Your Hosted API

When you deploy your .NET API server, follow these steps:

### 1. Update the API URL
Edit `docs/index.html` and replace this line:
```html
<cookie-consent api-url="https://your-api-server.com/api" cookie-name="demo-consent"></cookie-consent>
```

With your actual API URL:
```html
<cookie-consent api-url="https://yourdomain.com/api" cookie-name="demo-consent"></cookie-consent>
```

### 2. Ensure CORS is Configured
Your API needs to allow requests from `https://glideroggan.github.io`:

```csharp
// In your .NET API startup/program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGitHubPages", builder =>
        builder.WithOrigins("https://glideroggan.github.io")
               .AllowAnyMethod()
               .AllowAnyHeader());
});

app.UseCors("AllowGitHubPages");
```

### 3. Required API Endpoint
Your API should provide `GET /api/consent` returning:

```json
{
  "version": "1.0",
  "categories": [
    {
      "id": "necessary",
      "name": "Necessary",
      "description": "Required for basic site functionality",
      "required": true,
      "enabled": true
    },
    {
      "id": "analytics",
      "name": "Analytics", 
      "description": "Help us understand how you use our site",
      "required": false,
      "enabled": false
    },
    {
      "id": "marketing",
      "name": "Marketing",
      "description": "Used to deliver relevant ads", 
      "required": false,
      "enabled": false
    }
  ]
}
```

### 4. Test the Connection
1. Deploy your API changes
2. Update the `api-url` in `docs/index.html`
3. Commit and push to GitHub
4. Wait for GitHub Actions to deploy (~1-2 minutes)
5. Visit the demo and check the browser console for API connection status

### 5. Verify CORS (if needed)
If you see CORS errors:
- Check that your API allows `https://glideroggan.github.io` as an origin
- Ensure your API responds to OPTIONS requests for preflight
- Test your API directly from the browser console on the demo page

## Benefits of Connected API
- ✅ Centralized consent category management
- ✅ Version-controlled consent updates  
- ✅ Real-time consent policy changes
- ✅ Demonstrates full production capability

## Fallback Mode (Current)
Without an API, the component uses built-in default categories:
- ✅ Still demonstrates script blocking
- ✅ Shows all component features  
- ✅ Perfect for testing and evaluation
- ⚠️ Categories are hardcoded in component
