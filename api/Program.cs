
using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Admin;

var builder = WebApplication.CreateBuilder(args);

// Add Entity Framework with SQLite
builder.Services.AddDbContext<ConsentDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? "Data Source=consent.db"));

// Add CORS support for the demo and admin panel
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("AllowAll");

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ConsentDbContext>();
    context.Database.EnsureCreated();
}

// Legacy endpoint for existing demo
app.MapGet("/consent", async (ConsentDbContext db) => await ConsentService.GetConsentAsync(db));
app.MapGroup("/api/admin").MapAdminEndpoints();

app.Run();
