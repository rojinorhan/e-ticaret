namespace ECommerce.Api.DTOs.Coupon;

public class ApplyCouponResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public string CouponCode { get; set; } = string.Empty;

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }
}