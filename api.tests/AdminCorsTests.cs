namespace Api.Tests;

// Production admin CORS: only the GitHub Pages admin may call the admin API from a browser, and never with
// credentials (the key travels in a header, not a cookie). Dev origins used to leak into production through the
// array merge of appsettings.json and the AllowedAdminOrigins__0 env var.
public class AdminCorsTests
{
    private const string PagesOrigin = "https://glideroggan.github.io";

    private static HttpRequestMessage Preflight(string origin)
    {
        var request = new HttpRequestMessage(HttpMethod.Options, "/api/admin/categories");
        request.Headers.Add("Origin", origin);
        request.Headers.Add("Access-Control-Request-Method", "POST");
        request.Headers.Add("Access-Control-Request-Headers", "x-api-key,content-type");
        return request;
    }

    [Theory]
    [InlineData("http://localhost:3000")]
    [InlineData("http://admin.internal")]
    [InlineData("https://evil.example")]
    public async Task Production_preflight_from_other_origins_gets_no_cors_headers(string origin)
    {
        using var factory = new ApiFactory();
        var client = factory.CreateClient();

        var response = await client.SendAsync(Preflight(origin));

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    [Fact]
    public async Task Production_preflight_from_github_pages_is_allowed_without_credentials()
    {
        using var factory = new ApiFactory();
        var client = factory.CreateClient();

        var response = await client.SendAsync(Preflight(PagesOrigin));

        Assert.True(response.Headers.TryGetValues("Access-Control-Allow-Origin", out var origins));
        Assert.Equal(PagesOrigin, Assert.Single(origins));
        Assert.False(response.Headers.Contains("Access-Control-Allow-Credentials"));
    }
}
