using Microsoft.EntityFrameworkCore;
using Api.Models;

namespace Api.Data;

public class ConsentDbContext : DbContext
{
    public ConsentDbContext(DbContextOptions<ConsentDbContext> options) : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<CookieDetail> CookieDetails { get; set; }
    public DbSet<GlobalConfig> GlobalConfigs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships
        modelBuilder.Entity<CookieDetail>()
            .HasOne(cd => cd.Category)
            .WithMany(c => c.CookieDetails)
            .HasForeignKey(cd => cd.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure unique constraints
        modelBuilder.Entity<Category>()
            .HasIndex(c => c.Key)
            .IsUnique();

        // Configure unique constraint for cookie name within category
        modelBuilder.Entity<CookieDetail>()
            .HasIndex(cd => new { cd.CategoryId, cd.Name })
            .IsUnique();

        // Ensure only one global config record exists
        modelBuilder.Entity<GlobalConfig>()
            .HasData(new GlobalConfig
            {
                Id = 1,
                Version = "1.0",
                Description = "We use cookies to enhance your browsing experience and analyze our traffic. Please choose which types of cookies you want to allow.",
                PrivacyPolicyUrl = "",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

        // Seed default categories
        modelBuilder.Entity<Category>()
            .HasData(
                new Category
                {
                    Id = 1,
                    Key = "necessary",
                    Name = "Necessary",
                    Description = "Essential cookies required for basic site functionality",
                    Required = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Category
                {
                    Id = 2,
                    Key = "analytics",
                    Name = "Analytics",
                    Description = "Help us understand how visitors interact with our website",
                    Required = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Category
                {
                    Id = 3,
                    Key = "marketing",
                    Name = "Marketing",
                    Description = "Used to track visitors for advertising and marketing purposes",
                    Required = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );

        // Seed default cookie details
        modelBuilder.Entity<CookieDetail>()
            .HasData(
                // Necessary cookies
                new CookieDetail
                {
                    Id = 1,
                    CategoryId = 1,
                    Name = "session_id",
                    Purpose = "Maintain user session",
                    Duration = "Session",
                    Provider = "yoursite.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CookieDetail
                {
                    Id = 2,
                    CategoryId = 1,
                    Name = "csrf_token",
                    Purpose = "Security protection",
                    Duration = "1 hour",
                    Provider = "yoursite.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                // Analytics cookies
                new CookieDetail
                {
                    Id = 3,
                    CategoryId = 2,
                    Name = "_ga",
                    Purpose = "Google Analytics tracking",
                    Duration = "2 years",
                    Provider = "google.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CookieDetail
                {
                    Id = 4,
                    CategoryId = 2,
                    Name = "_gid",
                    Purpose = "Google Analytics session tracking",
                    Duration = "24 hours",
                    Provider = "google.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                // Marketing cookies
                new CookieDetail
                {
                    Id = 5,
                    CategoryId = 3,
                    Name = "_fbp",
                    Purpose = "Facebook Pixel tracking",
                    Duration = "90 days",
                    Provider = "facebook.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new CookieDetail
                {
                    Id = 6,
                    CategoryId = 3,
                    Name = "_gcl_au",
                    Purpose = "Google Ads conversion tracking",
                    Duration = "90 days",
                    Provider = "google.com",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            );
    }
}
