using ECommerce.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        var adminExists = await context.Users
            .AnyAsync(
                u => u.Role == "Admin",
                cancellationToken);

        if (adminExists)
        {
            return;
        }

        var admin = new User
        {
            FirstName = "System",
            LastName = "Admin",
            Email = "admin@ecommerce.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                "Admin123!"),
            Role = "Admin"
        };

        context.Users.Add(admin);

        await context.SaveChangesAsync(
            cancellationToken);
    }
}
