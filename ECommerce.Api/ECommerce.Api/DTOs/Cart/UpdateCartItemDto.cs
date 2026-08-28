using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Cart;

public class UpdateCartItemDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Ürün miktarı en az 1 olmalıdır.")]
    public int Quantity { get; set; }
}