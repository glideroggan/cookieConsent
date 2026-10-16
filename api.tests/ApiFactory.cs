using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Api.Tests;

// Runs the real Program against a throw-away SQLite file. The admin key and environment are set per test so the
// startup key check and the production CORS policy can be exercised.
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string ValidKey = "test-admin-key-0123456789abcdef0123456789";

    private readonly string? _adminKey;
    private readonly string _environment;
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"consent-test-{Guid.NewGuid():N}.db");

    public ApiFactory(string? adminKey = ValidKey, string environment = "Production")
    {
        _adminKey = adminKey;
        _environment = environment;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment(_environment);
        builder.ConfigureAppConfiguration((_, config) =>
        {
            var values = new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_dbPath};Pooling=False",
            };
            if (_adminKey != null) values["AdminApiKey"] = _adminKey;
            config.AddInMemoryCollection(values);
        });
    }

    public HttpClient CreateAdminClient()
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add("X-API-Key", ValidKey);
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        try { File.Delete(_dbPath); } catch (IOException) { }
    }
}
