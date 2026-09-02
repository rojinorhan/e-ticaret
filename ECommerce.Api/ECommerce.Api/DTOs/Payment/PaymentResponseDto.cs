namespace ECommerce.Api.DTOs.Payment;

public class PaymentResponseDto
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public string TransactionId { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;
}
