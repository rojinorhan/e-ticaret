using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Review;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;

    public ReviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ReviewDto>> GetByProductAsync(
        int productId,
        CancellationToken cancellationToken)
    {
        return await _context.Reviews
            .AsNoTracking()
            .Where(x => x.ProductId == productId)
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ReviewDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                UserId = x.UserId,
                UserName = x.User.FirstName + " " + x.User.LastName,
                Rating = x.Rating,
                Comment = x.Comment,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ReviewDto> CreateAsync(
        int userId,
        CreateReviewDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            throw new ArgumentException(
                "Puan 1 ile 5 arasında olmalıdır.");
        }

        if (string.IsNullOrWhiteSpace(dto.Comment))
        {
            throw new ArgumentException(
                "Yorum boş bırakılamaz.");
        }

        var productExists = await _context.Products
            .AnyAsync(
                x => x.Id == dto.ProductId,
                cancellationToken);

        if (!productExists)
        {
            throw new KeyNotFoundException(
                "Ürün bulunamadı.");
        }

        var alreadyReviewed = await _context.Reviews
            .AnyAsync(
                x =>
                    x.ProductId == dto.ProductId &&
                    x.UserId == userId,
                cancellationToken);

        if (alreadyReviewed)
        {
            throw new InvalidOperationException(
                "Bu ürüne daha önce yorum yaptınız.");
        }

        var hasPurchased = await _context.OrderItems
            .AnyAsync(
                x =>
                    x.ProductId == dto.ProductId &&
                    x.Order.UserId == userId,
                cancellationToken);

        if (!hasPurchased)
        {
            throw new InvalidOperationException(
                "Yorum yapabilmek için bu ürünü satın almış olmanız gerekir.");
        }

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        await _context.SaveChangesAsync(cancellationToken);

        await _context.Entry(review)
            .Reference(x => x.User)
            .LoadAsync(cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName =
                $"{review.User.FirstName} {review.User.LastName}",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task<ReviewDto> UpdateAsync(
        int userId,
        int reviewId,
        UpdateReviewDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            throw new ArgumentException(
                "Puan 1 ile 5 arasında olmalıdır.");
        }

        if (string.IsNullOrWhiteSpace(dto.Comment))
        {
            throw new ArgumentException(
                "Yorum boş bırakılamaz.");
        }

        var review = await _context.Reviews
            .Include(x => x.User)
            .FirstOrDefaultAsync(
                x => x.Id == reviewId,
                cancellationToken);

        if (review == null)
        {
            throw new KeyNotFoundException(
                "Yorum bulunamadı.");
        }

        if (review.UserId != userId)
        {
            throw new UnauthorizedAccessException(
                "Bu yorumu düzenleme yetkiniz yok.");
        }

        review.Rating = dto.Rating;
        review.Comment = dto.Comment.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserName =
                $"{review.User.FirstName} {review.User.LastName}",
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }

    public async Task DeleteAsync(
        int userId,
        int reviewId,
        CancellationToken cancellationToken)
    {
        var review = await _context.Reviews
            .FirstOrDefaultAsync(
                x => x.Id == reviewId,
                cancellationToken);

        if (review == null)
        {
            throw new KeyNotFoundException(
                "Yorum bulunamadı.");
        }

        if (review.UserId != userId)
        {
            throw new UnauthorizedAccessException(
                "Bu yorumu silme yetkiniz yok.");
        }

        _context.Reviews.Remove(review);

        await _context.SaveChangesAsync(cancellationToken);
    }
}