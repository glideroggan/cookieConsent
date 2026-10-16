namespace Api.Admin;

// The admin key is the only thing guarding config writes that reach every site embedding the widget. The API
// refuses to start with a key that is missing, short, or one of the placeholders that were published in this repo,
// so a deployment that forgets to set the secret fails loudly instead of accepting a known key.
public static class AdminApiKeyPolicy
{
    public const int MinimumLength = 32;

    private static readonly HashSet<string> KnownPlaceholders = new(StringComparer.OrdinalIgnoreCase)
    {
        "your-admin-api-key-change-this-in-production",
        "your-secure-admin-api-key-here",
        "your-production-api-key-here",
        "dev-admin-key-123",
    };

    public static void EnsureUsable(string? key)
    {
        // Error messages name the setting but never echo its value.
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("AdminApiKey is not configured. Set it through the environment (AdminApiKey) or user secrets.");

        if (key.Trim().Length < MinimumLength)
            throw new InvalidOperationException($"AdminApiKey is shorter than {MinimumLength} characters. Use a random value, e.g. `openssl rand -hex 32`.");

        if (KnownPlaceholders.Contains(key.Trim()))
            throw new InvalidOperationException("AdminApiKey is a published placeholder value. Use a random value, e.g. `openssl rand -hex 32`.");
    }
}
