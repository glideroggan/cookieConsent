namespace Api.Admin;

/// <summary>
/// The admin key (AdminApiKey) guards every /api/admin endpoint. The repository ships example keys (the appsettings.json
/// placeholder that documents the setting, the .env.example value, the local Development key and the demo and docs admin
/// configs); they are public, so outside Development a missing, empty or example key stops the start instead of serving
/// an admin API anyone could open. Development keeps its local key so local runs need no setup.
/// </summary>
public static class AdminKeyRules
{
    public const string SettingKey = "AdminApiKey";

    /// <summary>Every admin key the repository itself shows; matched trimmed and ignoring case.</summary>
    public static readonly IReadOnlyList<string> PublicExampleValues =
    [
        "your-admin-api-key-change-this-in-production", // appsettings.json, docker-compose.yml fallback, demo build
        "your-secure-admin-api-key-here",               // former .env.example value
        "dev-admin-key-123",                            // appsettings.Development.json, demo admin
        "your-production-api-key-here",                 // demo/config.js
        "production-change-me-please",                  // docs/admin/config.js
    ];

    /// <summary>Why the key is not acceptable for this environment, or null when it is. Never contains the key.</summary>
    public static string? Problem(string? key, IHostEnvironment environment)
    {
        if (environment.IsDevelopment()) return null;
        if (string.IsNullOrWhiteSpace(key)) return $"{SettingKey} is not set";
        var trimmed = key.Trim();
        if (PublicExampleValues.Any(example => string.Equals(trimmed, example, StringComparison.OrdinalIgnoreCase)))
            return $"{SettingKey} is a public example value (it is in the repository)";
        return null;
    }

    /// <summary>Startup check: logs the problem and stops the start (non-zero exit) before the app listens.</summary>
    public static void EnsureSet(string? key, IHostEnvironment environment, ILogger logger)
    {
        if (Problem(key, environment) is not { } problem) return;

        var message = $"{problem}. Set a random admin key in the environment ({SettingKey}) for the {environment.EnvironmentName} environment.";
        logger.LogCritical("{Message}", message);
        throw new InvalidOperationException(message);
    }
}
