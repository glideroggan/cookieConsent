using System.ComponentModel.DataAnnotations;
using Api.Models;

namespace Api.Admin;

// Minimal APIs do not run DataAnnotations on bound parameters by themselves, and SQLite does not enforce MaxLength,
// so every admin write validates its DTO here before anything touches the database.
public static class RequestValidation
{
    public static IResult? Validate(object dto)
    {
        var errors = new List<string>();
        Collect(dto, null, errors);
        return ToResult(errors);
    }

    public static IResult? ValidateImport(ImportDto import)
    {
        var errors = new List<string>();
        if (import.GlobalConfig != null) Collect(import.GlobalConfig, "globalConfig", errors);

        var categories = import.Categories ?? [];
        for (var i = 0; i < categories.Count; i++)
        {
            var category = categories[i];
            if (category == null)
            {
                errors.Add($"categories[{i}]: must not be null");
                continue;
            }
            Collect(category, $"categories[{i}]", errors);

            var cookies = category.CookieDetails ?? [];
            for (var j = 0; j < cookies.Count; j++)
            {
                if (cookies[j] == null)
                    errors.Add($"categories[{i}].cookieDetails[{j}]: must not be null");
                else
                    Collect(cookies[j], $"categories[{i}].cookieDetails[{j}]", errors);
            }
        }

        return ToResult(errors);
    }

    private static void Collect(object dto, string? path, List<string> errors)
    {
        var results = new List<ValidationResult>();
        if (Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true))
            return;

        foreach (var result in results)
            errors.Add(path == null ? result.ErrorMessage ?? "Invalid value" : $"{path}: {result.ErrorMessage}");
    }

    // Same { message } shape as the other admin 400s, so the admin page can show it as-is.
    private static IResult? ToResult(List<string> errors) =>
        errors.Count == 0 ? null : Results.BadRequest(new { message = string.Join("; ", errors), errors });
}
