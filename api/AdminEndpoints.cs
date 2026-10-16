using Microsoft.EntityFrameworkCore;
using Api.Data;
using Api.Models;

namespace Api.Admin;

public static class AdminEndpoints
{
    public static void MapAdminEndpoints(this IEndpointRouteBuilder app)
    {
        // Categories
        app.MapGet("/categories", Endpoints.GetCategories);
        app.MapPost("/categories", Endpoints.CreateCategory);
        app.MapPut("/categories/{id}", Endpoints.UpdateCategory);
        app.MapDelete("/categories/{id}", Endpoints.DeleteCategory);

        // Cookie Details
        app.MapGet("/cookie-details", Endpoints.GetCookieDetails);
        app.MapPost("/cookie-details", Endpoints.CreateCookieDetail);
        app.MapPut("/cookie-details/{id}", Endpoints.UpdateCookieDetail);
        app.MapDelete("/cookie-details/{id}", Endpoints.DeleteCookieDetail);

        // Global Config
        app.MapGet("/global-config", Endpoints.GetGlobalConfig);
        app.MapPut("/global-config", Endpoints.UpdateGlobalConfig);

        // Export/Import
        app.MapGet("/export", Endpoints.ExportConfig);
        app.MapPost("/import", Endpoints.ImportConfig);
    }
}

public static class Endpoints
{
    // Configuration limits
    private const int MaxCategories = 10;
    private const int MaxCookies = 100;

    // Categories
    public static async Task<IResult> GetCategories(ConsentDbContext db)
    {
        var categories = await db.Categories
            .OrderBy(c => c.Id)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Key = c.Key,
                Name = c.Name,
                Description = c.Description,
                Required = c.Required,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync();
        return Results.Ok(categories);
    }    public static async Task<IResult> CreateCategory(CreateCategoryDto dto, ConsentDbContext db)
    {
        if (RequestValidation.Validate(dto) is { } invalid) return invalid;

        // Check category limit (max 10)
        var categoryCount = await db.Categories.CountAsync();
        if (categoryCount >= MaxCategories)
            return Results.BadRequest(new { message = $"Maximum of {MaxCategories} categories allowed" });

        // Check for duplicate key
        if (await db.Categories.AnyAsync(c => c.Key == dto.Key))
            return Results.BadRequest(new { message = "Category key already exists" });

        var category = new Category
        {
            Key = dto.Key,
            Name = dto.Name,
            Description = dto.Description,
            Required = dto.Required,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Categories.Add(category);
        await db.SaveChangesAsync();
        await IncrementVersion(db, "major");
        
        return Results.Created($"/categories/{category.Id}", category);
    }

    public static async Task<IResult> UpdateCategory(int id, UpdateCategoryDto dto, ConsentDbContext db)
    {
        if (RequestValidation.Validate(dto) is { } invalid) return invalid;

        var existing = await db.Categories.FindAsync(id);
        if (existing == null) return Results.NotFound();

        // Check for duplicate key (excluding current)
        if (await db.Categories.AnyAsync(c => c.Key == dto.Key && c.Id != id))
            return Results.BadRequest(new { message = "Category key already exists" });

        existing.Key = dto.Key;
        existing.Name = dto.Name;
        existing.Description = dto.Description;
        existing.Required = dto.Required;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        await IncrementVersion(db, "major");
        
        return Results.Ok(existing);
    }

    public static async Task<IResult> DeleteCategory(int id, ConsentDbContext db)
    {
        var category = await db.Categories.Include(c => c.CookieDetails).FirstOrDefaultAsync(c => c.Id == id);
        if (category == null) return Results.NotFound();

        // Remove associated cookies first
        db.CookieDetails.RemoveRange(category.CookieDetails);
        db.Categories.Remove(category);
        await db.SaveChangesAsync();
        await IncrementVersion(db, "major");
        
        return Results.NoContent();
    }    // Cookie Details
    public static async Task<IResult> GetCookieDetails(ConsentDbContext db)
    {
        var cookies = await db.CookieDetails
            .Include(c => c.Category)
            .OrderBy(c => c.CategoryId)
            .ThenBy(c => c.Name)
            .Select(c => new CookieDetailDto
            {
                Id = c.Id,
                CategoryId = c.CategoryId,
                Name = c.Name,
                Purpose = c.Purpose,
                Duration = c.Duration,
                Provider = c.Provider,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                CategoryName = c.Category.Name
            })
            .ToListAsync();
        return Results.Ok(cookies);
    }    public static async Task<IResult> CreateCookieDetail(CreateCookieDetailDto dto, ConsentDbContext db)
    {
        if (RequestValidation.Validate(dto) is { } invalid) return invalid;

        // Check cookie limit (max 100 total)
        var cookieCount = await db.CookieDetails.CountAsync();
        if (cookieCount >= MaxCookies)
            return Results.BadRequest(new { message = $"Maximum of {MaxCookies} cookies allowed" });

        // Check if category exists
        if (!await db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return Results.BadRequest(new { message = "Category does not exist" });

        // Check for duplicate name in same category
        if (await db.CookieDetails.AnyAsync(c => c.Name == dto.Name && c.CategoryId == dto.CategoryId))
            return Results.BadRequest(new { message = "Cookie name already exists in this category" });

        var cookie = new CookieDetail
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Purpose = dto.Purpose,
            Duration = dto.Duration,
            Provider = dto.Provider,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.CookieDetails.Add(cookie);
        await db.SaveChangesAsync();
        await IncrementVersion(db, "minor");
        
        return Results.Created($"/cookie-details/{cookie.Id}", cookie);
    }

    public static async Task<IResult> UpdateCookieDetail(int id, CreateCookieDetailDto dto, ConsentDbContext db)
    {
        if (RequestValidation.Validate(dto) is { } invalid) return invalid;

        var existing = await db.CookieDetails.FindAsync(id);
        if (existing == null) return Results.NotFound();

        // Check if category exists
        if (!await db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return Results.BadRequest(new { message = "Category does not exist" });

        // Check for duplicate name in same category (excluding current)
        if (await db.CookieDetails.AnyAsync(c => c.Name == dto.Name && c.CategoryId == dto.CategoryId && c.Id != id))
            return Results.BadRequest(new { message = "Cookie name already exists in this category" });

        existing.Name = dto.Name;
        existing.Purpose = dto.Purpose;
        existing.Duration = dto.Duration;
        existing.Provider = dto.Provider;
        existing.CategoryId = dto.CategoryId;
        existing.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        await IncrementVersion(db, "minor");
        
        return Results.Ok(existing);
    }

    public static async Task<IResult> DeleteCookieDetail(int id, ConsentDbContext db)
    {
        var cookie = await db.CookieDetails.FindAsync(id);
        if (cookie == null) return Results.NotFound();

        db.CookieDetails.Remove(cookie);
        await db.SaveChangesAsync();
        await IncrementVersion(db, "minor");
        
        return Results.NoContent();
    }

    // Global Config
    public static async Task<IResult> GetGlobalConfig(ConsentDbContext db)
    {
        var config = await db.GlobalConfigs.FirstOrDefaultAsync();
        if (config == null)
        {
            // Return default config
            config = new GlobalConfig
            {
                Version = "1.0.0",
                Description = "We use cookies to enhance your browsing experience and analyze our traffic. Please choose which types of cookies you want to allow.",
                PrivacyPolicyUrl = null
            };
        }
        return Results.Ok(config);
    }

    public static async Task<IResult> UpdateGlobalConfig(UpdateGlobalConfigDto dto, ConsentDbContext db)
    {
        if (RequestValidation.Validate(dto) is { } invalid) return invalid;

        var existing = await db.GlobalConfigs.FirstOrDefaultAsync();
        GlobalConfig? config = null;

        if (existing == null)
        {
            config = new GlobalConfig
            {
                Version = "1.0.0",
                Description = dto.Description,
                PrivacyPolicyUrl = dto.PrivacyPolicyUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.GlobalConfigs.Add(config);
        }
        else
        {
            existing.Description = dto.Description;
            existing.PrivacyPolicyUrl = dto.PrivacyPolicyUrl;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        await IncrementVersion(db, "patch");
        
        return Results.Ok(existing ?? config);
    }

    // Export/Import
    public static async Task<IResult> ExportConfig(ConsentDbContext db)
    {
        var config = await db.GlobalConfigs.FirstOrDefaultAsync();
        var categories = await db.Categories.Include(c => c.CookieDetails).ToListAsync();

        var export = new
        {
            GlobalConfig = config,
            Categories = categories,
            ExportedAt = DateTime.UtcNow
        };

        return Results.Ok(export);
    }    public static async Task<IResult> ImportConfig(ImportDto import, ConsentDbContext db)
    {
        // Validate limits before importing
        if (import.Categories != null)
        {            if (import.Categories.Count > MaxCategories)
                return Results.BadRequest(new { message = $"Import contains more than {MaxCategories} categories (limit: {MaxCategories})" });

            var totalCookies = import.Categories.Sum(c => c?.CookieDetails?.Count ?? 0);
            if (totalCookies > MaxCookies)
                return Results.BadRequest(new { message = $"Import contains {totalCookies} cookies (limit: {MaxCookies})" });
        }

        if (RequestValidation.ValidateImport(import) is { } invalid) return invalid;

        // Clear existing data
        db.CookieDetails.RemoveRange(db.CookieDetails);
        db.Categories.RemoveRange(db.Categories);
        db.GlobalConfigs.RemoveRange(db.GlobalConfigs);

        // Import global config
        if (import.GlobalConfig != null)
        {
            db.GlobalConfigs.Add(new GlobalConfig
            {
                Version = string.IsNullOrEmpty(import.GlobalConfig.Version) ? "1.0.0" : import.GlobalConfig.Version,
                Description = import.GlobalConfig.Description,
                PrivacyPolicyUrl = import.GlobalConfig.PrivacyPolicyUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        // Import categories and cookies; ids and category links are assigned here, never taken from the payload
        if (import.Categories != null)
        {
            foreach (var categoryDto in import.Categories)
            {
                var category = new Category
                {
                    Key = categoryDto.Key,
                    Name = categoryDto.Name,
                    Description = categoryDto.Description,
                    Required = categoryDto.Required,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                foreach (var cookieDto in categoryDto.CookieDetails ?? [])
                {
                    category.CookieDetails.Add(new CookieDetail
                    {
                        Name = cookieDto.Name,
                        Purpose = cookieDto.Purpose,
                        Duration = cookieDto.Duration,
                        Provider = cookieDto.Provider,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                db.Categories.Add(category);
            }
        }

        await db.SaveChangesAsync();
        
        // Set version from import or increment
        var config = await db.GlobalConfigs.FirstOrDefaultAsync();
        if (config != null && !string.IsNullOrEmpty(import.GlobalConfig?.Version))
        {
            config.Version = import.GlobalConfig.Version;
            await db.SaveChangesAsync();
        }
        else
        {
            await IncrementVersion(db, "major");
        }

        return Results.Ok(new { message = "Configuration imported successfully" });
    }

    // Helper method to increment version
    private static async Task IncrementVersion(ConsentDbContext db, string type)
    {
        var config = await db.GlobalConfigs.FirstOrDefaultAsync();
        if (config == null)
        {
            config = new GlobalConfig
            {
                Version = "1.0.0",
                Description = "Default description",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.GlobalConfigs.Add(config);
        }

        var version = config.Version.Split('.').Select(int.Parse).ToArray();
        if (version.Length < 3) version = new[] { 1, 0, 0 };

        switch (type)
        {
            case "major":
                version[0]++;
                version[1] = 0;
                version[2] = 0;
                break;
            case "minor":
                version[1]++;
                version[2] = 0;
                break;
            case "patch":
                version[2]++;
                break;
        }

        config.Version = string.Join(".", version);
        config.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
    }
}