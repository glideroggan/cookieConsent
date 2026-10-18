using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

/// <summary>
/// The real app on its own SQLite file in a fresh temp folder, so tests never touch the repo's or a server's database.
/// Extra settings win over appsettings*.json, the way environment variables do on the server.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly Dictionary<string, string?> _settings;

    public ApiFactory(Dictionary<string, string?>? settings = null)
    {
        DataFolder = Path.Combine(Path.GetTempPath(), "cookie-consent-tests-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(DataFolder);
        _settings = new Dictionary<string, string?>(settings ?? new())
        {
            ["ConnectionStrings:DefaultConnection"] = $"Data Source={Path.Combine(DataFolder, "consent.db")}"
        };
    }

    public string DataFolder { get; }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(_settings));
    }

    /// <summary>Takes the database away under the running app: pooled connections closed, the folder deleted.</summary>
    public void RemoveDatabase()
    {
        SqliteConnection.ClearAllPools();
        Directory.Delete(DataFolder, recursive: true);
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        SqliteConnection.ClearAllPools();
        try { if (Directory.Exists(DataFolder)) Directory.Delete(DataFolder, recursive: true); }
        catch (IOException) { }
    }
}
