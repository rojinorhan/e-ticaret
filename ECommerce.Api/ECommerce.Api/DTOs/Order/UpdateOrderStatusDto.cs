using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Order;

public class UpdateOrderStatusDto
{
    [Required(ErrorMessage = "Sipariş durumu zorunludur.")]
    [RegularExpression(
        "^(Pending|Confirmed|Shipped|Delivered|Cancelled)$",
        ErrorMessage = "Geçersiz sipariş durumu.")]
    public string Status { get; set; } = string.Empty;
}