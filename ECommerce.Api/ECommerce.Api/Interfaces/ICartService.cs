
using ECommerce.Api.DTOs.Cart;

namespace ECommerce.Api.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartAsync(
        CancellationToken cancellationToken);

    Task<CartDto> AddItemAsync(
        AddCartItemDto dto,
        CancellationToken cancellationToken);

    Task<CartDto> UpdateItemAsync(
        int cartItemId,
        UpdateCartItemDto dto,
        CancellationToken cancellationToken);

    Task RemoveItemAsync(
        int cartItemId,
        CancellationToken cancellationToken);

    Task ClearCartAsync(
        CancellationToken cancellationToken);
}
