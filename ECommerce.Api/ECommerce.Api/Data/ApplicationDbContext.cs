using ECommerce.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Coupon> Coupons { get; set; }
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<Payment> Payments { get; set; }
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Favorite> Favorites { get; set; }
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<EmailVerificationCode> EmailVerificationCodes =>
        Set<EmailVerificationCode>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);
    }
}