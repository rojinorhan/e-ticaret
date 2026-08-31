using System.Security.Claims;
using ECommerce.Api.DTOs.Review;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [HttpGet("product/{productId:int}")]
    public async Task<IActionResult> GetByProduct(
        int productId,
        CancellationToken cancellationToken)
    {
        var reviews =
            await _reviewService.GetByProductAsync(
                productId,
                cancellationToken);

        return Ok(reviews);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateReviewDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var review =
            await _reviewService.CreateAsync(
                userId,
                dto,
                cancellationToken);

        return Ok(review);
    }

    [Authorize]
    [HttpPut("{reviewId:int}")]
    public async Task<IActionResult> Update(
        int reviewId,
        [FromBody] UpdateReviewDto dto,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        var review =
            await _reviewService.UpdateAsync(
                userId,
                reviewId,
                dto,
                cancellationToken);

        return Ok(review);
    }

    [Authorize]
    [HttpDelete("{reviewId:int}")]
    public async Task<IActionResult> Delete(
        int reviewId,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();

        await _reviewService.DeleteAsync(
            userId,
            reviewId,
            cancellationToken);

        return NoContent();
    }

    private int GetUserId()
    {
        var userId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException(
                "Kullanıcı bilgisi alınamadı.");
        }

        return id;
    }
}