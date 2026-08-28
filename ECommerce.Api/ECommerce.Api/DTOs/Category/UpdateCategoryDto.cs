using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Category;

public class UpdateCategoryDto
{
    [Required(ErrorMessage = "Kategori adı zorunludur.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "Kategori adı 2-100 karakter arasında olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(
        500,
        ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;
}