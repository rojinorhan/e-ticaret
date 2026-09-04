namespace ECommerce.Api.DTOs.Payment;

public class PaymentRequestDto
{
    public string CardHolderName { get; set; } = string.Empty;

    public string CardNumber { get; set; } = string.Empty;

    public string ExpiryDate { get; set; } = string.Empty;

    public string Cvv { get; set; } = string.Empty;

    // Ödeme sırasında kullanılacak kupon kodu.
    // Kupon kullanılmıyorsa null gelebilir.
    public string? CouponCode { get; set; }
}
