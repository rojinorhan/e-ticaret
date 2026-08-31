using ECommerce.Api.DTOs.Review;

namespace ECommerce.Api.Interfaces;

public interface IReviewService
{
    Task<List<ReviewDto>> GetByProductAsync(
        int productId,
        CancellationToken cancellationToken);

    Task<ReviewDto> CreateAsync(
        int userId,
        CreateReviewDto dto,
        CancellationToken cancellationToken);

    Task<ReviewDto> UpdateAsync(
        int userId,
        int reviewId,
        UpdateReviewDto dto,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        int userId,
        int reviewId,
        CancellationToken cancellationToken);
}