using ECommerce.Api.DTOs.Favorite;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoriteController(
        IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    // Kullanıcının favorilerini getir
    [HttpGet]
    public async Task<IActionResult> GetMyFavorites(
        CancellationToken cancellationToken)
    {
        var favorites =
            await _favoriteService.GetMyFavoritesAsync(
                cancellationToken);

        return Ok(favorites);
    }

    // Ürünü favorilere ekle
    [HttpPost]
    public async Task<IActionResult> Add(
        AddFavoriteDto dto,
        CancellationToken cancellationToken)
    {
        var result =
            await _favoriteService.AddAsync(
                dto,
                cancellationToken);

        if (!result)
        {
            return Conflict(new
            {
                message = "Bu ürün zaten favorilerinizde."
            });
        }

        return Ok(new
        {
            message = "Ürün favorilere eklendi."
        });
    }

    // Ürünü favorilerden çıkar
    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Remove(
        int productId,
        CancellationToken cancellationToken)
    {
        var result =
            await _favoriteService.RemoveAsync(
                productId,
                cancellationToken);

        if (!result)
        {
            return NotFound(new
            {
                message = "Ürün favorilerinizde bulunamadı."
            });
        }

        return Ok(new
        {
            message = "Ürün favorilerden çıkarıldı."
        });
    }

    // Ürün favorilerde mi?
    [HttpGet("check/{productId:int}")]
    public async Task<IActionResult> Check(
        int productId,
        CancellationToken cancellationToken)
    {
        var result =
            await _favoriteService.IsFavoriteAsync(
                productId,
                cancellationToken);

        return Ok(new
        {
            isFavorite = result
        });
    }
}
