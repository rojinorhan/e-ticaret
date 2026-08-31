using ECommerce.Api.Data;
using ECommerce.Api.Data.Seed;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Configuration;

public static class SeedConfiguration
{
    public static async Task SeedDatabaseAsync(
        this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var context = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        await context.Database.MigrateAsync();

        await AdminSeeder.SeedAsync(
            context,
            CancellationToken.None);
    }
}