using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "Ad alanı zorunludur.")]
    [StringLength(
        50,
        MinimumLength = 2,
        ErrorMessage = "Ad 2-50 karakter arasında olmalıdır.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Soyad alanı zorunludur.")]
    [StringLength(
        50,
        MinimumLength = 2,
        ErrorMessage = "Soyad 2-50 karakter arasında olmalıdır.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Şifre alanı zorunludur.")]
    [StringLength(
        100,
        MinimumLength = 6,
        ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    public string Password { get; set; } = string.Empty;
}