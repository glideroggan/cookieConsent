
var builder = WebApplication.CreateBuilder(args);

// Add CORS support for the demo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowDemo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Enable CORS
app.UseCors("AllowDemo");

// API endpoints
app.MapGet("/", () => "Cookie Consent API");
app.MapGet("/consent", () => ConsentService.GetConsent());

app.Run();

// Models matching the TypeScript interfaces
public class ConsentResponse
{
    public string Version { get; set; } = "1.0";
    public ConsentCategory[] Categories { get; set; } = [];
}

public class ConsentCategory
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Required { get; set; }
    public bool Enabled { get; set; }
}

public static class ConsentService
{
    public static ConsentResponse GetConsent()
    {
        return new ConsentResponse
        {
            Version = "1.3",
            Categories =
            [
                new ConsentCategory
                {
                    Id = "necessary",
                    Name = "Necessary",
                    Description = "Required for basic site functionality",
                    Required = true,
                    Enabled = true
                },
                new ConsentCategory
                {
                    Id = "analytics",
                    Name = "Analytics",
                    Description = "Help us understand how you use our site",
                    Required = false,
                    Enabled = false
                },
                new ConsentCategory
                {
                    Id = "marketing",
                    Name = "Marketing",
                    Description = "Used to deliver relevant ads and content to you",
                    Required = false,
                    Enabled = false
                }
            ]
        };
    }
}
