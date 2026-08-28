using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Product;

public class CreateProductDto
{
    [Required(ErrorMessage = "Ürün adı zorunludur.")]
    [StringLength(
        100,
        MinimumLength = 2,
        ErrorMessage = "Ürün adı 2-100 karakter arasında olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    [StringLength(
        500,
        ErrorMessage = "Açıklama en fazla 500 karakter olabilir.")]
    public string Description { get; set; } = string.Empty;

    [Range(
        0.01,
        double.MaxValue,
        ErrorMessage = "Ürün fiyatı 0'dan büyük olmalıdır.")]
    public decimal Price { get; set; }

    [Range(
        0,
        int.MaxValue,
        ErrorMessage = "Stok miktarı negatif olamaz.")]
    public int Stock { get; set; }

    [Range(
        1,
        int.MaxValue,
        ErrorMessage = "Geçerli bir kategori seçilmelidir.")]
    public int CategoryId { get; set; }
}