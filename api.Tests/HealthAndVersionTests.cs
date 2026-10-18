using System.Net;
using System.Text.Json;

namespace Api.Tests;

public class HealthAndVersionTests
{
    /// <summary>The version in api/VERSION, the file Deployer's release reads, so the app and the image tag cannot drift.</summary>
    private static string VersionFile()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "cookieConsent.sln"))) dir = dir.Parent;
        Assert.NotNull(dir);
        return File.ReadAllText(Path.Combine(dir!.FullName, "api", "VERSION")).Trim();
    }

    private static async Task<JsonElement> Json(HttpResponseMessage response) =>
        JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement;

    [Fact]
    public async Task Health_answers_200_when_the_database_answers()
    {
        using var factory = new ApiFactory();
        var response = await factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await Json(response);
        Assert.Equal("ok", body.GetProperty("status").GetString());
        Assert.Equal("ok", body.GetProperty("database").GetString());
        Assert.Equal(VersionFile(), body.GetProperty("version").GetString());
    }

    [Fact]
    public async Task Health_answers_503_when_the_database_is_unreachable()
    {
        using var factory = new ApiFactory();
        var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);

        factory.RemoveDatabase();
        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var text = await response.Content.ReadAsStringAsync();
        var body = JsonDocument.Parse(text).RootElement;
        Assert.Equal("unhealthy", body.GetProperty("status").GetString());
        Assert.Equal("unreachable", body.GetProperty("database").GetString());
        // The probe is anonymous: it never shows where the database lives or what failed.
        Assert.DoesNotContain(factory.DataFolder, text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("SQLite", text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Health_answers_503_when_the_database_has_no_tables()
    {
        // SQLite creates a missing file on open, so "it connects" is not enough: an empty file must count as down.
        using var factory = new ApiFactory();
        var client = factory.CreateClient();
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health")).StatusCode);

        factory.RemoveDatabase();
        Directory.CreateDirectory(factory.DataFolder);
        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task Version_answers_the_version_in_the_VERSION_file()
    {
        using var factory = new ApiFactory();
        var response = await factory.CreateClient().GetAsync("/version");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(VersionFile(), (await Json(response)).GetProperty("version").GetString());
        Assert.Contains("no-store", response.Headers.CacheControl?.ToString() ?? "");
    }
}
