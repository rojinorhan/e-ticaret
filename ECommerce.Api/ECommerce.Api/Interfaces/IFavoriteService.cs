using ECommerce.Api.DTOs.Favorite;

namespace ECommerce.Api.Interfaces;

public interface IFavoriteService
{
    Task<List<FavoriteDto>> GetMyFavoritesAsync(
        CancellationToken cancellationToken);

    Task<bool> AddAsync(
        AddFavoriteDto dto,
        CancellationToken cancellationToken);

    Task<bool> RemoveAsync(
        int productId,
        CancellationToken cancellationToken);

    Task<bool> IsFavoriteAsync(
        int productId,
        CancellationToken cancellationToken);
}