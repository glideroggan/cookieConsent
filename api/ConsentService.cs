using Api.Models;
using Api.Data;
using Microsoft.EntityFrameworkCore;

public static class ConsentService
{
    public static async Task<ConsentResponse> GetConsentAsync(ConsentDbContext db)
    {
        // Get global configuration
        var globalConfig = await db.GlobalConfigs.FirstOrDefaultAsync();
        
        // Get all categories
        var categories = await db.Categories.OrderBy(c => c.Id).ToListAsync();
        
        // Map to response format expected by the frontend
        var consentCategories = categories.Select(c => new ConsentCategory
        {
            Id = c.Key, // Use the Key property as the Id for the frontend
            Name = c.Name,
            Description = c.Description,
            Required = c.Required,
            Enabled = c.Required // Set enabled to true for required categories, false for optional
        }).ToArray();
        
        return new ConsentResponse
        {
            Version = globalConfig?.Version ?? "1.0",
            Description = globalConfig?.Description ?? "We use cookies to enhance your browsing experience and analyze our traffic. Please choose which types of cookies you want to allow.",
            Categories = consentCategories
        };
    }
}
