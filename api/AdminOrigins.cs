namespace Api.Admin;

/// <summary>
/// The origins the admin CORS policy allows. Environment variables can only override AllowedAdminOrigins entries by
/// index, so the appsettings*.json entries beyond them would stay allowed. AdminCorsOrigins (comma-separated) replaces
/// the whole list instead, which is how a staging slot gets its own origins and none of production's. Set but empty
/// means no admin origin at all. With neither setting there is no admin origin either: no address lives in code.
/// </summary>
public static class AdminOrigins
{
    public const string ReplaceKey = "AdminCorsOrigins";
    public const string ListKey = "AllowedAdminOrigins";

    public static string[] Read(IConfiguration configuration)
    {
        var replacement = configuration.GetSection(ReplaceKey);
        if (replacement.Value is not null)
        {
            return replacement.Value
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }

        return configuration.GetSection(ListKey).Get<string[]>()?
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .ToArray() ?? [];
    }
}
