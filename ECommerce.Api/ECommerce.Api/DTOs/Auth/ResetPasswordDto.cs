using System.ComponentModel.DataAnnotations;

namespace ECommerce.Api.DTOs.Auth;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "Email alanı zorunludur.")]
    [EmailAddress(ErrorMessage = "Geçerli bir email adresi giriniz.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Doğrulama kodu zorunludur.")]
    [StringLength(
        6,
        MinimumLength = 6,
        ErrorMessage = "Doğrulama kodu 6 haneli olmalıdır.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Yeni şifre zorunludur.")]
    [StringLength(
        100,
        MinimumLength = 6,
        ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
    public string NewPassword { get; set; } = string.Empty;
}