namespace ECommerce.Api.DTOs.Payment;

public class PaymentResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    // Ödeme başarılı olduktan sonra oluşturulan siparişin ID'si.
    public int? OrderId { get; set; }

    // Mock ödeme işlem numarası.
    public string? TransactionId { get; set; }

    // Gerçekten ödenen tutar.
    // Kupon varsa indirim uygulanmış tutardır.
    public decimal Amount { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;
}
