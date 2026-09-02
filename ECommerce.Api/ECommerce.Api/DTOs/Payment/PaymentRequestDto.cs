namespace ECommerce.Api.DTOs.Payment;

public class PaymentRequestDto
{
    public int OrderId { get; set; }

    public string CardHolderName { get; set; } = string.Empty;

    public string CardNumber { get; set; } = string.Empty;

    public string ExpiryDate { get; set; } = string.Empty;

    public string Cvv { get; set; } = string.Empty;
}
