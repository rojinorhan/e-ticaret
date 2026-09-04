using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Payment;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContext _userContext;

    public PaymentService(
        ApplicationDbContext context,
        IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<PaymentResponseDto> ProcessPaymentAsync(
        PaymentRequestDto dto,
        CancellationToken cancellationToken = default)
    {
        // ---------------------------------------------------------
        // 1. KART BİLGİLERİNİ KONTROL ET
        // ---------------------------------------------------------

        var cardNumber = dto.CardNumber
            .Replace(" ", "")
            .Trim();

        // Mock test kartı
        if (cardNumber != "5555555555554444")
        {
            return FailedPayment(
                "Ödeme reddedildi. Kart bilgilerini kontrol ediniz.");
        }

        // CVV kontrolü
        if (dto.Cvv != "123")
        {
            return FailedPayment(
                "Ödeme reddedildi. CVV bilgisi hatalı.");
        }

        // Son kullanma tarihi kontrolü
        if (dto.ExpiryDate != "12/30")
        {
            return FailedPayment(
                "Ödeme reddedildi. Son kullanma tarihi geçersiz.");
        }

        // ---------------------------------------------------------
        // 2. KULLANICININ SEPETİNİ BUL
        // ---------------------------------------------------------

        var userId = _userContext.UserId;

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            return FailedPayment(
                "Sepet bulunamadı.");
        }

        if (cart.Items.Count == 0)
        {
            return FailedPayment(
                "Sepetiniz boş.");
        }

        // ---------------------------------------------------------
        // 3. STOK KONTROLÜ
        // ---------------------------------------------------------

        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Product is null)
            {
                return FailedPayment(
                    "Sepette geçersiz bir ürün bulundu.");
            }

            if (cartItem.Quantity <= 0)
            {
                return FailedPayment(
                    "Sepette geçersiz ürün miktarı bulundu.");
            }

            if (cartItem.Quantity > cartItem.Product.Stock)
            {
                return FailedPayment(
                    $"Yetersiz stok: {cartItem.Product.Name}. " +
                    $"Mevcut stok: {cartItem.Product.Stock}");
            }
        }

        // ---------------------------------------------------------
        // 4. SEPET TOPLAMINI HESAPLA
        // ---------------------------------------------------------

        decimal cartTotal = 0;

        foreach (var cartItem in cart.Items)
        {
            cartTotal +=
                cartItem.Quantity *
                cartItem.Product.Price;
        }

        cartTotal = Math.Round(cartTotal, 2);

        // ---------------------------------------------------------
        // 5. KUPONU KONTROL ET
        // ---------------------------------------------------------

        Coupon? coupon = null;

        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var couponCode = dto.CouponCode
                .Trim()
                .ToUpperInvariant();

            coupon = await _context.Coupons
                .FirstOrDefaultAsync(
                    x => x.Code == couponCode,
                    cancellationToken);

            if (coupon is null)
            {
                return FailedPayment(
                    "Kupon bulunamadı.");
            }

            if (!coupon.IsActive)
            {
                return FailedPayment(
                    "Bu kupon aktif değil.");
            }

            var now = DateTime.UtcNow;

            if (now < coupon.StartDate)
            {
                return FailedPayment(
                    "Bu kupon henüz kullanıma açılmadı.");
            }

            if (now > coupon.EndDate)
            {
                return FailedPayment(
                    "Bu kuponun kullanım süresi dolmuş.");
            }

            if (coupon.UsageLimit.HasValue &&
                coupon.UsedCount >= coupon.UsageLimit.Value)
            {
                return FailedPayment(
                    "Bu kuponun kullanım limiti dolmuş.");
            }

            if (cartTotal < coupon.MinimumCartAmount)
            {
                return FailedPayment(
                    $"Bu kupon için minimum sepet tutarı " +
                    $"{coupon.MinimumCartAmount:C} olmalıdır.");
            }
        }

        // ---------------------------------------------------------
        // 6. İNDİRİMİ HESAPLA
        // ---------------------------------------------------------

        decimal discountAmount = 0;

        if (coupon is not null)
        {
            if (coupon.DiscountType == "Percentage")
            {
                discountAmount =
                    cartTotal *
                    coupon.DiscountValue /
                    100m;
            }
            else
            {
                discountAmount =
                    coupon.DiscountValue;
            }

            if (discountAmount > cartTotal)
            {
                discountAmount = cartTotal;
            }

            discountAmount =
                Math.Round(discountAmount, 2);
        }

        var finalAmount =
            Math.Round(
                cartTotal - discountAmount,
                2);

        // ---------------------------------------------------------
        // 7. TRANSACTION BAŞLAT
        // ---------------------------------------------------------

        await using var transaction =
            await _context.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            // -----------------------------------------------------
            // 8. SİPARİŞİ OLUŞTUR
            // -----------------------------------------------------

            var order = new Order
            {
                UserId = userId,
                Status = OrderStatus.Confirmed,
                TotalPrice = finalAmount,
                CreatedAt = DateTime.UtcNow
            };

            // -----------------------------------------------------
            // 9. SİPARİŞ ÜRÜNLERİNİ EKLE
            // -----------------------------------------------------

            foreach (var cartItem in cart.Items)
            {
                var orderItem = new OrderItem
                {
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Product.Price
                };

                order.Items.Add(orderItem);

                // Stok azalt
                cartItem.Product.Stock -=
                    cartItem.Quantity;
            }

            _context.Orders.Add(order);

            // -----------------------------------------------------
            // 10. SİPARİŞİ KAYDET
            // -----------------------------------------------------
            // Burada OrderId oluşur.

            await _context.SaveChangesAsync(
                cancellationToken);

            // -----------------------------------------------------
            // 11. TRANSACTION ID OLUŞTUR
            // -----------------------------------------------------

            var transactionId =
                $"TXN-{Guid.NewGuid():N}"[..20];

            // -----------------------------------------------------
            // 12. KART NUMARASINI MASKELE
            // -----------------------------------------------------

            var maskedCardNumber =
                "**** **** **** " +
                cardNumber[^4..];

            // -----------------------------------------------------
            // 13. ÖDEME KAYDI OLUŞTUR
            // -----------------------------------------------------

            var payment = new Payment
            {
                OrderId = order.Id,
                MaskedCardNumber = maskedCardNumber,
                CardHolderName =
                    dto.CardHolderName.Trim(),
                Amount = finalAmount,
                PaymentStatus = "Success",
                TransactionId = transactionId,
                PaymentDate = DateTime.UtcNow
            };

            _context.Payments.Add(payment);

            // -----------------------------------------------------
            // 14. KUPON KULLANIM SAYISINI ARTIR
            // -----------------------------------------------------

            if (coupon is not null)
            {
                coupon.UsedCount++;
            }

            // -----------------------------------------------------
            // 15. SEPETİ TEMİZLE
            // -----------------------------------------------------

            _context.CartItems.RemoveRange(
                cart.Items);

            // -----------------------------------------------------
            // 16. ÖDEME + KUPON + SEPET DEĞİŞİKLİKLERİNİ KAYDET
            // -----------------------------------------------------

            await _context.SaveChangesAsync(
                cancellationToken);

            // -----------------------------------------------------
            // 17. TRANSACTION'I TAMAMLA
            // -----------------------------------------------------

            await transaction.CommitAsync(
                cancellationToken);

            // -----------------------------------------------------
            // 18. BAŞARILI RESPONSE
            // -----------------------------------------------------

            return new PaymentResponseDto
            {
                Success = true,
                Message = "Ödeme başarıyla tamamlandı.",
                OrderId = order.Id,
                TransactionId = transactionId,
                Amount = finalAmount,
                PaymentStatus = "Success"
            };
        }
        catch
        {
            // Bir işlem başarısız olursa
            // sipariş, stok, ödeme ve kupon değişiklikleri
            // birlikte geri alınır.

            await transaction.RollbackAsync(
                cancellationToken);

            throw;
        }
    }

    // -------------------------------------------------------------
    // BAŞARISIZ ÖDEME RESPONSE
    // -------------------------------------------------------------

    private static PaymentResponseDto FailedPayment(
        string message)
    {
        return new PaymentResponseDto
        {
            Success = false,
            Message = message,
            PaymentStatus = "Failed"
        };
    }
}
