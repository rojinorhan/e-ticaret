namespace ECommerce.Api.Data.Entities;

public class EmailVerificationCode
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Code { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
}