# Docker Deployment Guide

This guide will help you deploy the Cookie Consent component and API using Docker.

## Quick Start

1. **Prepare the build** (build admin panel first):
   ```bash
   .\prepare-docker.ps1
   ```

2. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the services:**
   - **Web Component**: http://localhost:8080
   - **🛠️ Admin Panel**: http://localhost:8080/admin
   - **API**: http://localhost:5220
   - **API Docs**: http://localhost:5220/api/admin/global-config

## Services

### API Service (Port 5220)
- .NET API for managing consent data
- SQLite database stored in Docker volume
- CORS enabled for all origins
- Endpoints:
  - `GET /api/admin/global-config` - Get global configuration
  - `GET /api/admin/categories` - Get consent categories
  - `POST /api/admin/categories` - Add new category
  - And more admin endpoints...

### Web Service (Port 8080)
- Nginx server hosting the built component files
- Serves `cookie-consent.js` and `cookie-consent.esm.js`
- **🛠️ Admin Panel** available at `/admin/` route
- CORS enabled for component distribution
- Static file serving with caching headers
- Admin panel configured to connect to dockerized API

## Development

### Building Individual Services

**Build API only:**
```bash
docker-compose build api
```

**Build Web only:**
```bash
docker-compose build web
```

### Running in Development Mode

**Start with logs:**
```bash
docker-compose up --build
```

**Run in background:**
```bash
docker-compose up -d --build
```

**View logs:**
```bash
docker-compose logs -f
```

### Stopping Services

```bash
docker-compose down
```

**Remove volumes (will delete database):**
```bash
docker-compose down -v
```

## Configuration

### API Configuration
- Database: SQLite stored in `/app/data/consent.db` (persisted in Docker volume)
- Environment: Production
- CORS: Allows all origins (configure for production)

### Web Configuration
- Nginx serves files from `/usr/share/nginx/html`
- CORS headers added for component access
- Caching enabled for JS/CSS files

## Production Deployment

1. **Update CORS settings** in `api/Program.cs` to restrict origins
2. **Configure environment variables** in `docker-compose.yml`
3. **Use Docker secrets** for sensitive data
4. **Set up reverse proxy** (nginx/Apache) for SSL termination
5. **Configure persistent volumes** for database backup

## Troubleshooting

### API not starting
- Check if port 5220 is available
- View API logs: `docker-compose logs api`
- Ensure .NET 10.0 base image is available

### Web component not loading
- Check if port 8080 is available
- Verify build completed: `docker-compose logs web`
- Check nginx configuration in `web/nginx.conf`

### Database issues
- Database is created automatically on first run
- To reset database: `docker-compose down -v && docker-compose up --build`
- View database location: `docker volume inspect cookieconsent_api-data`

## File Structure
```
├── api/
│   ├── dockerfile          # .NET API container
│   ├── *.cs               # API source files
│   └── api.csproj         # .NET project file
├── web/
│   ├── dockerfile          # Web server container
│   ├── nginx.conf         # Nginx configuration
│   ├── index.html         # Landing page
│   └── src/               # Component source files
└── docker-compose.yml     # Multi-service orchestration
```
