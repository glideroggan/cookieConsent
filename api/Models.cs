using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Api.Models;

[Table("Categories")]
public class Category
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Key { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public bool Required { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public virtual ICollection<CookieDetail> CookieDetails { get; set; } = new List<CookieDetail>();
}

[Table("CookieDetails")]
public class CookieDetail
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(300)]
    public string Purpose { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Duration { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Provider { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    [ForeignKey("CategoryId")]
    public virtual Category Category { get; set; } = null!;
}

[Table("GlobalConfig")]
public class GlobalConfig
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(20)]
    public string Version { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? PrivacyPolicyUrl { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// DTOs for API responses
public class CategoryDto
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool Required { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCategoryDto
{
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^[a-z][a-z0-9_]*$", ErrorMessage = "Key must be lowercase letters, numbers, and underscores only, starting with a letter")]
    public string Key { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public bool Required { get; set; }
}

public class UpdateCategoryDto
{
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^[a-z][a-z0-9_]*$", ErrorMessage = "Key must be lowercase letters, numbers, and underscores only, starting with a letter")]
    public string Key { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public bool Required { get; set; }
}

public class CookieDetailDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryKey { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string Provider { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCookieDetailDto
{
    [Required]
    public int CategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(300)]
    public string Purpose { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Duration { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Provider { get; set; } = string.Empty;
}

public class GlobalConfigDto
{
    public int Id { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? PrivacyPolicyUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateGlobalConfigDto
{
    [Required]
    [MaxLength(20)]
    public string Version { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? PrivacyPolicyUrl { get; set; }
}

// Simple models for public consent API
public class ConsentResponse
{
    public string Version { get; set; } = "1.0";
    public string Description { get; set; } = "";
    public ConsentCategory[] Categories { get; set; } = [];
}

public class ConsentCategory
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public bool Required { get; set; }
    public bool Enabled { get; set; }
}

public class CookieInfo
{
    public string Name { get; set; } = "";
    public string Purpose { get; set; } = "";
    public string Duration { get; set; } = "";
    public string Provider { get; set; } = "";
    public string CategoryId { get; set; } = "";
}
