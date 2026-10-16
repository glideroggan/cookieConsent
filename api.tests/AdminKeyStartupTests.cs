using System.Net;

namespace Api.Tests;

// A missing or guessable admin key must stop the API from starting: a placeholder key that is published in the repo
// would otherwise open every admin route (the fail-open default the security sweep found).
public class AdminKeyStartupTests
{
    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("too-short-key-1234567890")]
    [InlineData("your-admin-api-key-change-this-in-production")]
    public void Startup_refuses_unusable_admin_key(string? key)
    {
        using var factory = new ApiFactory(adminKey: key);

        var ex = Assert.ThrowsAny<Exception>(() => factory.CreateClient());

        Assert.Contains("AdminApiKey", ex.ToString());
        if (!string.IsNullOrWhiteSpace(key))
            Assert.DoesNotContain(key, ex.ToString());
    }

    [Fact]
    public async Task Startup_accepts_long_random_key()
    {
        using var factory = new ApiFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/consent");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Admin_route_without_key_is_401()
    {
        using var factory = new ApiFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/admin/categories");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
