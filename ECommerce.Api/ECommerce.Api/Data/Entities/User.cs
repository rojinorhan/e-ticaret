namespace ECommerce.Api.Data.Entities;

public class User
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User";
    
    public bool IsEmailVerified { get; set; } = false;

    public ICollection<EmailVerificationCode> VerificationCodes { get; set; }
        = new List<EmailVerificationCode>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}