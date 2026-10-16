using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace Api.Tests;

// Admin writes are validated on the server: the widget renders category text on every embedding site, so the
// admin API is the trust boundary. Routes bind DTOs (no nested entities, no client-chosen ids) and enforce the
// Key format, string lengths and an https-only privacy policy URL.
public class AdminValidationTests : IDisposable
{
    private const string Hostile = "<img src=x onerror=alert(1)>";

    private readonly ApiFactory _factory = new();
    private readonly HttpClient _client;

    public AdminValidationTests()
    {
        _client = _factory.CreateAdminClient();
    }

    public void Dispose() => _factory.Dispose();

    private async Task<int> CountAsync(string path)
    {
        var items = await _client.GetFromJsonAsync<JsonElement>(path);
        return items.GetArrayLength();
    }

    [Theory]
    [InlineData(Hostile)]
    [InlineData("Analytics")]
    [InlineData("1abc")]
    [InlineData("has space")]
    [InlineData("")]
    public async Task Create_category_rejects_bad_key(string key)
    {
        var response = await _client.PostAsJsonAsync("/api/admin/categories",
            new { key, name = "Name", description = "Desc", required = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_category_rejects_too_long_name()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/categories",
            new { key = "stats", name = new string('a', 101), description = "Desc", required = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_category_rejects_too_long_description()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/categories",
            new { key = "stats", name = "Stats", description = new string('a', 501), required = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_category_rejects_bad_key()
    {
        var response = await _client.PutAsJsonAsync("/api/admin/categories/2",
            new { key = Hostile, name = "Analytics", description = "Desc", required = false });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_category_ignores_client_id_and_nested_cookies()
    {
        var cookiesBefore = await CountAsync("/api/admin/cookie-details");
        var cookies = Enumerable.Range(0, 3).Select(i => new
        {
            id = 900 + i, categoryId = 1, name = $"c{i}", purpose = "p", duration = "d", provider = "x"
        });

        var response = await _client.PostAsJsonAsync("/api/admin/categories",
            new { id = 1, key = "stats", name = "Stats", description = "Desc", required = false, cookieDetails = cookies });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.NotEqual(1, created.GetProperty("id").GetInt32());
        Assert.Equal(cookiesBefore, await CountAsync("/api/admin/cookie-details"));
    }

    [Fact]
    public async Task Create_cookie_ignores_nested_category()
    {
        var categoriesBefore = await CountAsync("/api/admin/categories");

        var response = await _client.PostAsJsonAsync("/api/admin/cookie-details", new
        {
            id = 1, categoryId = 1, name = "new_cookie", purpose = "p", duration = "d", provider = "x",
            category = new { key = "smuggled", name = "Smuggled", description = "d", required = true }
        });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.NotEqual(1, created.GetProperty("id").GetInt32());
        Assert.Equal(categoriesBefore, await CountAsync("/api/admin/categories"));
    }

    [Fact]
    public async Task Create_cookie_rejects_too_long_purpose()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/cookie-details",
            new { categoryId = 1, name = "c", purpose = new string('a', 301), duration = "d", provider = "x" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("http://example.com/privacy")]
    [InlineData("data:text/html,hi")]
    [InlineData("not a url")]
    public async Task Global_config_rejects_non_https_privacy_url(string url)
    {
        var response = await _client.PutAsJsonAsync("/api/admin/global-config",
            new { version = "1.0.0", description = "We use cookies", privacyPolicyUrl = url });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("https://example.com/privacy")]
    [InlineData(null)]
    [InlineData("")]
    public async Task Global_config_accepts_https_or_empty_privacy_url(string? url)
    {
        var response = await _client.PutAsJsonAsync("/api/admin/global-config",
            new { version = "1.0.0", description = "We use cookies", privacyPolicyUrl = url });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Global_config_rejects_too_long_description()
    {
        var response = await _client.PutAsJsonAsync("/api/admin/global-config",
            new { version = "1.0.0", description = new string('a', 1001) });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_rejects_hostile_category_key()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/import", new
        {
            globalConfig = new { version = "2.0.0", description = "d" },
            categories = new[] { new { key = Hostile, name = "N", description = "D", required = false, cookieDetails = Array.Empty<object>() } }
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_rejects_javascript_privacy_url()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/import", new
        {
            globalConfig = new { version = "2.0.0", description = "d", privacyPolicyUrl = "javascript:alert(1)" },
            categories = Array.Empty<object>()
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_maps_valid_data_and_ignores_client_ids()
    {
        var response = await _client.PostAsJsonAsync("/api/admin/import", new
        {
            globalConfig = new { id = 77, version = "2.0.0", description = "Imported" },
            categories = new[]
            {
                new
                {
                    id = 55, key = "necessary", name = "Necessary", description = "D", required = true,
                    cookieDetails = new[] { new { id = 66, categoryId = 99, name = "sid", purpose = "p", duration = "d", provider = "x" } }
                }
            }
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var consent = await _client.GetFromJsonAsync<JsonElement>("/api/consent");
        var category = Assert.Single(consent.GetProperty("categories").EnumerateArray());
        Assert.Equal("necessary", category.GetProperty("id").GetString());
        Assert.Equal("2.0.0", consent.GetProperty("version").GetString());
        Assert.Equal(1, await CountAsync("/api/admin/cookie-details"));
    }

    [Fact]
    public async Task Public_consent_returns_stored_text_unchanged()
    {
        // Escaping is the widget's job; the API stores and returns the text as-is.
        var create = await _client.PostAsJsonAsync("/api/admin/categories",
            new { key = "stats", name = Hostile, description = "Desc", required = false });
        Assert.Equal(HttpStatusCode.Created, create.StatusCode);

        var consent = await _client.GetFromJsonAsync<JsonElement>("/api/consent");

        Assert.Contains(consent.GetProperty("categories").EnumerateArray(),
            c => c.GetProperty("name").GetString() == Hostile);
    }
}
