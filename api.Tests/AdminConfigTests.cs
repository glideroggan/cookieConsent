using System.Net;

namespace Api.Tests;

/// <summary>
/// A staging slot runs the same image as production with its own environment: its own admin key and its own admin CORS
/// origins, and nothing of production's may leak in from appsettings*.json.
/// </summary>
public class AdminConfigTests
{
    private const string StagingKey = "staging-key-for-tests";
    private const string StagingOrigin = "https://staging-admin.example.test";
    private const string AppsettingsOrigin = "http://localhost:3000";

    private static HttpRequestMessage AdminGet(string? key, string? origin)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/admin/global-config");
        if (key is not null) request.Headers.Add("X-API-Key", key);
        if (origin is not null) request.Headers.Add("Origin", origin);
        return request;
    }

    private static string? AllowedOrigin(HttpResponseMessage response) =>
        response.Headers.TryGetValues("Access-Control-Allow-Origin", out var values) ? values.Single() : null;

    [Fact]
    public async Task The_admin_key_from_the_environment_is_the_only_key_accepted()
    {
        using var factory = new ApiFactory(new() { ["AdminApiKey"] = StagingKey });
        var client = factory.CreateClient();

        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(AdminGet(StagingKey, null))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(AdminGet("dev-admin-key-123", null))).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(AdminGet(null, null))).StatusCode);
    }

    [Fact]
    public async Task AdminCorsOrigins_replaces_the_appsettings_origins()
    {
        using var factory = new ApiFactory(new() { ["AdminApiKey"] = StagingKey, ["AdminCorsOrigins"] = $" {StagingOrigin} , https://second.example.test" });
        var client = factory.CreateClient();

        Assert.Equal(StagingOrigin, AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, StagingOrigin))));
        Assert.Equal("https://second.example.test", AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, "https://second.example.test"))));
        Assert.Null(AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, AppsettingsOrigin))));
    }

    [Fact]
    public async Task An_empty_AdminCorsOrigins_allows_no_admin_origin()
    {
        using var factory = new ApiFactory(new() { ["AdminApiKey"] = StagingKey, ["AdminCorsOrigins"] = "" });
        var client = factory.CreateClient();

        Assert.Null(AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, AppsettingsOrigin))));
    }

    [Fact]
    public async Task Without_AdminCorsOrigins_the_appsettings_origins_still_apply()
    {
        using var factory = new ApiFactory(new() { ["AdminApiKey"] = StagingKey });
        var client = factory.CreateClient();

        Assert.Equal(AppsettingsOrigin, AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, AppsettingsOrigin))));
        Assert.Null(AllowedOrigin(await client.SendAsync(AdminGet(StagingKey, StagingOrigin))));
    }
}
