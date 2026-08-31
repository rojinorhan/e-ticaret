using ECommerce.Api.Data;
using ECommerce.Api.DTOs.Favorite;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class FavoriteService : IFavoriteService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContext _userContext;

    public FavoriteService(
        ApplicationDbContext context,
        IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<List<FavoriteDto>> GetMyFavoritesAsync(
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        return await _context.Favorites
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new FavoriteDto
            {
                Id = x.Id,
                ProductId = x.ProductId,

                ProductName = x.Product.Name,
                Description = x.Product.Description,

                Price = x.Product.Price,
                Stock = x.Product.Stock,

                CategoryId = x.Product.CategoryId,
                CategoryName = x.Product.Category.Name,

                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> AddAsync(
        AddFavoriteDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var productExists = await _context.Products
            .AnyAsync(
                x => x.Id == dto.ProductId,
                cancellationToken);

        if (!productExists)
        {
            throw new KeyNotFoundException(
                "Ürün bulunamadı.");
        }

        var alreadyFavorite = await _context.Favorites
            .AnyAsync(
                x =>
                    x.UserId == userId &&
                    x.ProductId == dto.ProductId,
                cancellationToken);

        if (alreadyFavorite)
        {
            return false;
        }

        var favorite = new Data.Entities.Favorite
        {
            UserId = userId,
            ProductId = dto.ProductId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Favorites.Add(favorite);

        await _context.SaveChangesAsync(
            cancellationToken);

        return true;
    }

    public async Task<bool> RemoveAsync(
        int productId,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var favorite = await _context.Favorites
            .FirstOrDefaultAsync(
                x =>
                    x.UserId == userId &&
                    x.ProductId == productId,
                cancellationToken);

        if (favorite is null)
        {
            return false;
        }

        _context.Favorites.Remove(favorite);

        await _context.SaveChangesAsync(
            cancellationToken);

        return true;
    }

    public async Task<bool> IsFavoriteAsync(
        int productId,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        return await _context.Favorites
            .AnyAsync(
                x =>
                    x.UserId == userId &&
                    x.ProductId == productId,
                cancellationToken);
    }
}
