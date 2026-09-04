namespace ECommerce.Api.DTOs.Coupon;

public class UpdateCouponDto
{
    public string Code { get; set; } = string.Empty;

    public string DiscountType { get; set; } = "Percentage";

    public decimal DiscountValue { get; set; }

    public decimal MinimumCartAmount { get; set; }

    public int? UsageLimit { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }
}