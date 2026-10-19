using System.Net;

namespace Api.Tests;

/// <summary>
/// Outside Development the app refuses to start with a missing, empty or placeholder admin key: the placeholder is public
/// in appsettings.json, so a server that forgot to set its own key would let anyone in. Development keeps the local key.
/// </summary>
public class AdminKeyGuardTests
{
    private const string Placeholder = "your-admin-api-key-change-this-in-production";

    private static Exception StartFails(Dictionary<string, string?> settings, string environment)
    {
        using var factory = new ApiFactory(settings, environment);
        return Assert.ThrowsAny<Exception>(() => factory.CreateClient());
    }

    private static async Task StartsAndAnswers(Dictionary<string, string?> settings, string environment)
    {
        using var factory = new ApiFactory(settings, environment);
        var response = await factory.CreateClient().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public void Production_with_the_placeholder_key_refuses_to_start()
    {
        // appsettings.json holds the placeholder, so no override is the same as a server that never set its key.
        var error = StartFails(new(), "Production");

        Assert.Contains("AdminApiKey", error.Message);
        Assert.DoesNotContain(Placeholder, error.Message);
    }

    [Fact]
    public void Production_with_an_empty_key_refuses_to_start()
    {
        var error = StartFails(new() { ["AdminApiKey"] = "" }, "Production");

        Assert.Contains("AdminApiKey", error.Message);
    }

    [Theory]
    [InlineData("   ")]
    [InlineData("\t")]
    public void Production_with_a_whitespace_only_key_refuses_to_start(string key)
    {
        var error = StartFails(new() { ["AdminApiKey"] = key }, "Production");

        Assert.Contains("AdminApiKey is not set", error.Message);
    }

    /// <summary>Every admin key the repository itself ships (appsettings, .env.example, demo and docs admin configs).</summary>
    [Theory]
    [InlineData("your-admin-api-key-change-this-in-production")]
    [InlineData("your-secure-admin-api-key-here")]
    [InlineData("dev-admin-key-123")]
    [InlineData("your-production-api-key-here")]
    [InlineData("production-change-me-please")]
    [InlineData("  your-admin-api-key-change-this-in-production  ")]
    [InlineData("YOUR-ADMIN-API-KEY-CHANGE-THIS-IN-PRODUCTION")]
    [InlineData(" Dev-Admin-Key-123\t")]
    public void Production_with_a_public_example_key_refuses_to_start(string key)
    {
        var error = StartFails(new() { ["AdminApiKey"] = key }, "Production");

        Assert.Contains("AdminApiKey is a public example value", error.Message);
        Assert.DoesNotContain(key.Trim(), error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Production_with_a_real_key_starts()
    {
        await StartsAndAnswers(new() { ["AdminApiKey"] = "k8Zq2vN7rT4wY1pL6sD9fH3jM5xC0bQe" }, "Production");
    }

    [Fact]
    public async Task Development_with_the_placeholder_key_starts()
    {
        await StartsAndAnswers(new() { ["AdminApiKey"] = Placeholder }, "Development");
    }
}
