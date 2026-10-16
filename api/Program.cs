
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Admin;

var builder = WebApplication.CreateBuilder(args);

// Add Entity Framework with SQLite
builder.Services.AddDbContext<ConsentDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=consent.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("PublicConsent", policy =>
    {
        policy.AllowAnyOrigin()  // Any website can get consent config
              .WithMethods("GET") // Only GET requests
              .AllowAnyHeader();
    });    options.AddPolicy("AdminOnly", policy =>
    {
        // Admin origins come only from configuration: no code fallback, so missing config means no browser access
        // to admin. No credentials either: the key travels in the X-API-Key header, not in a cookie.
        var allowedAdminOrigins = builder.Configuration.GetSection("AllowedAdminOrigins").Get<string[]>() ?? [];

        policy.WithOrigins(allowedAdminOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

AdminApiKeyPolicy.EnsureUsable(app.Configuration["AdminApiKey"]);

// Enable CORS
app.UseCors();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ConsentDbContext>();
    context.Database.EnsureCreated();
}

// Legacy endpoint for existing demo
app.MapGet("/consent", async (ConsentDbContext db) => await ConsentService.GetConsentAsync(db))
    .RequireCors("PublicConsent");

// Public consent endpoint (what websites use)
app.MapGet("/api/consent", async (ConsentDbContext db) => await ConsentService.GetConsentAsync(db))
    .RequireCors("PublicConsent");

app.MapGroup("/api/admin")
    .RequireCors("AdminOnly")
    .AddEndpointFilter(async (context, next) =>
    {
        // Allow OPTIONS requests for CORS preflight to pass through
        if (context.HttpContext.Request.Method == "OPTIONS")
        {
            return await next(context);
        }
        
        var apiKey = context.HttpContext.Request.Headers["X-API-Key"].FirstOrDefault();
        var configuredKey = context.HttpContext.RequestServices
            .GetService<IConfiguration>()?["AdminApiKey"];

        if (string.IsNullOrEmpty(configuredKey) || apiKey != configuredKey)
        {
            context.HttpContext.Response.StatusCode = 401;
            // await context.HttpContext.Response.WriteAsync("Unauthorized");
            // return null; // Fixed: return null instead of Results.Unauthorized()
            return Results.Unauthorized();
        }
        
        return await next(context);
    })
    .MapAdminEndpoints();

app.Run();

// Lets the integration tests host the real app with WebApplicationFactory<Program>.
public partial class Program { }
