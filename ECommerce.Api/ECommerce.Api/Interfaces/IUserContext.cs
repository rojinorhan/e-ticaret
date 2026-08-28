namespace ECommerce.Api.Interfaces;

public interface IUserContext
{
    int UserId { get; }

    string? Role { get; }
}
