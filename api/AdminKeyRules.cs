namespace Api.Admin;

/// <summary>
/// The admin key (AdminApiKey) guards every /api/admin endpoint. appsettings.json ships a placeholder that documents the
/// setting; it is public in the repository, so outside Development a missing, empty or placeholder key stops the start
/// instead of serving an admin API anyone could open. Development keeps its local key so local runs need no setup.
/// </summary>
public static class AdminKeyRules
{
    public const string SettingKey = "AdminApiKey";

    /// <summary>The value in appsettings.json: public, so never acceptable outside Development.</summary>
    public const string Placeholder = "your-admin-api-key-change-this-in-production";

    /// <summary>Why the key is not acceptable for this environment, or null when it is. Never contains the key.</summary>
    public static string? Problem(string? key, IHostEnvironment environment)
    {
        if (environment.IsDevelopment()) return null;
        if (string.IsNullOrWhiteSpace(key)) return $"{SettingKey} is not set";
        if (string.Equals(key.Trim(), Placeholder, StringComparison.OrdinalIgnoreCase))
            return $"{SettingKey} is still the placeholder from appsettings.json (it is public)";
        return null;
    }

    /// <summary>Startup check: logs one error and stops the start (non-zero exit) before the app listens.</summary>
    public static void EnsureSet(string? key, IHostEnvironment environment, ILogger logger)
    {
        if (Problem(key, environment) is not { } problem) return;

        var message = $"{problem}. Set a random admin key in the environment ({SettingKey}) for the {environment.EnvironmentName} environment.";
        logger.LogCritical("{Message}", message);
        throw new InvalidOperationException(message);
    }
}
