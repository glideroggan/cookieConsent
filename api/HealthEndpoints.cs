using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Api.Data;

namespace Api.Health;

/// <summary>
/// The running version. api.csproj takes its &lt;Version&gt; from api/VERSION, which is also the versionFile Deployer's
/// staging release reads, so the image tag and the version the app reports cannot drift apart.
/// </summary>
public static class AppVersion
{
    public static string Current { get; } =
        (typeof(AppVersion).Assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? "unknown")
        .Split('+')[0];
}

public static class HealthEndpoints
{
    /// <summary>Anonymous probes for Deployer's slot checks and the app suite; they reveal only the version.</summary>
    public static void MapHealthEndpoints(this WebApplication app)
    {
        app.MapGet("/health", Health);
        app.MapGet("/version", (HttpContext context) =>
        {
            // A cached answer could show the previous release after a flip, which is what this endpoint is for.
            context.Response.Headers.CacheControl = "no-store";
            return Results.Json(new { version = AppVersion.Current });
        });
    }

    private static async Task<IResult> Health(ConsentDbContext db, ILogger<ConsentDbContext> logger, CancellationToken cancellationToken)
    {
        try
        {
            // A real query on a seeded table: SQLite creates a missing file on open, so "it connects" would also be true
            // for an empty database.
            await db.GlobalConfigs.AsNoTracking().AnyAsync(cancellationToken);
            return Results.Json(new { status = "ok", database = "ok", version = AppVersion.Current });
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogWarning(ex, "Health check: the database did not answer");
            return Results.Json(new { status = "unhealthy", database = "unreachable", version = AppVersion.Current },
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }
    }
}
