using ECommerce.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data.Seed;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context,
        CancellationToken cancellationToken)
    {
        const string adminEmail = "rojinorhan.39@gmail.com";
        const string adminPassword = "Admin12";

        var admin = await context.Users
            .FirstOrDefaultAsync(
                u => u.Email == adminEmail,
                cancellationToken);

        if (admin is null)
        {
            admin = new User
            {
                FirstName = "System",
                LastName = "Admin",
                Email = adminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(
                    adminPassword),
                Role = "Admin"
            };

            context.Users.Add(admin);
        }
        else
        {
            admin.FirstName = "System";
            admin.LastName = "Admin";
            admin.Role = "Admin";

            admin.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(adminPassword);
        }

        await context.SaveChangesAsync(
            cancellationToken);
    }
}