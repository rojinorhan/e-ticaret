using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Cart;

public class AddCartItemDto
{
    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Geçerli bir ürün seçilmelidir.")]
    public int ProductId { get; set; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Ürün miktarı en az 1 olmalıdır.")]
    public int Quantity { get; set; }
}