
using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Payment;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;

    public PaymentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentResponseDto> ProcessPaymentAsync(
        PaymentRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        // 1. Siparişi kontrol et
        var order = await _context.Orders
            .FirstOrDefaultAsync(
                x => x.Id == dto.OrderId,
                cancellationToken);

        if (order == null)
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = "Sipariş bulunamadı.",
                PaymentStatus = "Failed"
            };
        }

        // 2. Sipariş zaten ödenmiş mi?
        var existingPayment = await _context.Payments
            .AnyAsync(
                x => x.OrderId == dto.OrderId &&
                     x.PaymentStatus == "Success",
                cancellationToken);

        if (existingPayment)
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = "Bu sipariş için ödeme zaten yapılmış.",
                PaymentStatus = "Failed"
            };
        }

        // 3. Kart numarasını temizle
        var cardNumber = dto.CardNumber
            .Replace(" ", "")
            .Trim();

        // 4. Mock ödeme kontrolü
        // Test kartı:
        // 5555555555554444 -> başarılı
        if (cardNumber != "5555555555554444")
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = "Ödeme reddedildi. Kart bilgilerini kontrol ediniz.",
                PaymentStatus = "Failed"
            };
        }

        // 5. CVV kontrolü
        if (dto.Cvv != "123")
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = "Ödeme reddedildi. CVV bilgisi hatalı.",
                PaymentStatus = "Failed"
            };
        }

        // 6. Son kullanma tarihi kontrolü
        if (dto.ExpiryDate != "12/30")
        {
            return new PaymentResponseDto
            {
                Success = false,
                Message = "Ödeme reddedildi. Son kullanma tarihi geçersiz.",
                PaymentStatus = "Failed"
            };
        }

        // 7. Kart numarasının sadece son 4 hanesini al
        var maskedCardNumber =
            "**** **** **** " + cardNumber[^4..];

        // 8. Transaction ID oluştur
        var transactionId =
            $"TXN-{Guid.NewGuid():N}"[..20];

        // 9. Ödeme kaydını oluştur
        var payment = new Payment
        {
            OrderId = order.Id,
            MaskedCardNumber = maskedCardNumber,
            CardHolderName = dto.CardHolderName,
            Amount = order.TotalPrice,
            PaymentStatus = "Success",
            TransactionId = transactionId,
            PaymentDate = DateTime.UtcNow
        };

        _context.Payments.Add(payment);

        // 10. Sipariş durumunu güncelle
        order.Status = OrderStatus.Confirmed;

        await _context.SaveChangesAsync(cancellationToken);

        return new PaymentResponseDto
        {
            Success = true,
            Message = "Ödeme başarıyla tamamlandı.",
            TransactionId = transactionId,
            Amount = order.TotalPrice,
            PaymentStatus = "Success"
        };
    }
}
