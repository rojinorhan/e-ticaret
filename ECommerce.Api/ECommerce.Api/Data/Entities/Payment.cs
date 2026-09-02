
namespace ECommerce.Api.Data.Entities;

public class Payment
{
    public int Id { get; set; }

    public int OrderId { get; set; }

    // Gerçek kart numarasını tutmuyoruz.
    // Sadece son 4 haneyi saklıyoruz.
    public string MaskedCardNumber { get; set; } = string.Empty;

    public string CardHolderName { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string PaymentStatus { get; set; } = string.Empty;

    public string TransactionId { get; set; } = string.Empty;

    public DateTime PaymentDate { get; set; }
}