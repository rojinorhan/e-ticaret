using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Favorite;

public class AddFavoriteDto
{
    [Required(ErrorMessage = "Ürün ID zorunludur.")]
    public int ProductId { get; set; }
}