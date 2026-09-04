using ECommerce.Api.DTOs.Coupon;

namespace ECommerce.Api.Interfaces;

public interface ICouponService
{
    Task<List<CouponResponseDto>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<CouponResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<CouponResponseDto> CreateAsync(
        CreateCouponDto dto,
        CancellationToken cancellationToken);

    Task<CouponResponseDto?> UpdateAsync(
        int id,
        UpdateCouponDto dto,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken);

    Task<ApplyCouponResponseDto> ApplyAsync(
        ApplyCouponDto dto,
        int userId,
        CancellationToken cancellationToken);
}
