using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Coupon;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class CouponService : ICouponService
{
    private readonly ApplicationDbContext _context;

    public CouponService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // TÜM KUPONLARI GETİR
    // ============================================================

    public async Task<List<CouponResponseDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Coupons
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new CouponResponseDto
            {
                Id = x.Id,
                Code = x.Code,
                DiscountType = x.DiscountType,
                DiscountValue = x.DiscountValue,
                MinimumCartAmount = x.MinimumCartAmount,
                UsageLimit = x.UsageLimit,
                UsedCount = x.UsedCount,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    // ============================================================
    // ID'YE GÖRE KUPON GETİR
    // ============================================================

    public async Task<CouponResponseDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _context.Coupons
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CouponResponseDto
            {
                Id = x.Id,
                Code = x.Code,
                DiscountType = x.DiscountType,
                DiscountValue = x.DiscountValue,
                MinimumCartAmount = x.MinimumCartAmount,
                UsageLimit = x.UsageLimit,
                UsedCount = x.UsedCount,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    // ============================================================
    // KUPON OLUŞTUR
    // ============================================================

    public async Task<CouponResponseDto> CreateAsync(
        CreateCouponDto dto,
        CancellationToken cancellationToken)
    {
        var code = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException(
                "Kupon kodu boş olamaz.");
        }

        if (dto.DiscountType != "Percentage" &&
            dto.DiscountType != "FixedAmount")
        {
            throw new ArgumentException(
                "DiscountType Percentage veya FixedAmount olmalıdır.");
        }

        if (dto.DiscountValue <= 0)
        {
            throw new ArgumentException(
                "İndirim değeri 0'dan büyük olmalıdır.");
        }

        if (dto.DiscountType == "Percentage" &&
            dto.DiscountValue > 100)
        {
            throw new ArgumentException(
                "Yüzdelik indirim 100'den büyük olamaz.");
        }

        if (dto.MinimumCartAmount < 0)
        {
            throw new ArgumentException(
                "Minimum sepet tutarı negatif olamaz.");
        }

        if (dto.UsageLimit.HasValue &&
            dto.UsageLimit.Value <= 0)
        {
            throw new ArgumentException(
                "Kullanım limiti 0'dan büyük olmalıdır.");
        }

        if (dto.StartDate >= dto.EndDate)
        {
            throw new ArgumentException(
                "Başlangıç tarihi bitiş tarihinden önce olmalıdır.");
        }

        var exists = await _context.Coupons
            .AnyAsync(
                x => x.Code == code,
                cancellationToken);

        if (exists)
        {
            throw new ArgumentException(
                "Bu kupon kodu zaten mevcut.");
        }

        var coupon = new Coupon
        {
            Code = code,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinimumCartAmount = dto.MinimumCartAmount,
            UsageLimit = dto.UsageLimit,
            UsedCount = 0,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);

        await _context.SaveChangesAsync(
            cancellationToken);

        return MapToDto(coupon);
    }

    // ============================================================
    // KUPON GÜNCELLE
    // ============================================================

    public async Task<CouponResponseDto?> UpdateAsync(
        int id,
        UpdateCouponDto dto,
        CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (coupon == null)
        {
            return null;
        }

        var code = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException(
                "Kupon kodu boş olamaz.");
        }

        if (dto.DiscountType != "Percentage" &&
            dto.DiscountType != "FixedAmount")
        {
            throw new ArgumentException(
                "DiscountType Percentage veya FixedAmount olmalıdır.");
        }

        if (dto.DiscountValue <= 0)
        {
            throw new ArgumentException(
                "İndirim değeri 0'dan büyük olmalıdır.");
        }

        if (dto.DiscountType == "Percentage" &&
            dto.DiscountValue > 100)
        {
            throw new ArgumentException(
                "Yüzdelik indirim 100'den büyük olamaz.");
        }

        if (dto.MinimumCartAmount < 0)
        {
            throw new ArgumentException(
                "Minimum sepet tutarı negatif olamaz.");
        }

        if (dto.UsageLimit.HasValue &&
            dto.UsageLimit.Value <= 0)
        {
            throw new ArgumentException(
                "Kullanım limiti 0'dan büyük olmalıdır.");
        }

        if (dto.StartDate >= dto.EndDate)
        {
            throw new ArgumentException(
                "Başlangıç tarihi bitiş tarihinden önce olmalıdır.");
        }

        var duplicate = await _context.Coupons
            .AnyAsync(
                x => x.Code == code &&
                     x.Id != id,
                cancellationToken);

        if (duplicate)
        {
            throw new ArgumentException(
                "Bu kupon kodu başka bir kupon tarafından kullanılıyor.");
        }

        coupon.Code = code;
        coupon.DiscountType = dto.DiscountType;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MinimumCartAmount = dto.MinimumCartAmount;
        coupon.UsageLimit = dto.UsageLimit;
        coupon.StartDate = dto.StartDate;
        coupon.EndDate = dto.EndDate;
        coupon.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(
            cancellationToken);

        return MapToDto(coupon);
    }

    // ============================================================
    // KUPON SİL
    // ============================================================

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);

        if (coupon == null)
        {
            return false;
        }

        _context.Coupons.Remove(coupon);

        await _context.SaveChangesAsync(
            cancellationToken);

        return true;
    }

    // ============================================================
    // KUPON UYGULA
    // ============================================================
    //
    // ÖNEMLİ:
    // Artık frontend'den CartTotal almıyoruz.
    //
    // Backend:
    // 1. Kullanıcıyı bulur
    // 2. Kullanıcının sepetini bulur
    // 3. Ürünlerin gerçek fiyatlarını alır
    // 4. Gerçek sepet toplamını hesaplar
    // 5. Kuponu kontrol eder
    // 6. İndirimi hesaplar
    //
    // Böylece kullanıcı frontend üzerinden
    // sahte bir cartTotal gönderemez.
    // ============================================================

    public async Task<ApplyCouponResponseDto> ApplyAsync(
        ApplyCouponDto dto,
        int userId,
        CancellationToken cancellationToken)
    {
        var code = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(code))
        {
            return Fail(
                "Kupon kodu boş olamaz.");
        }

        // --------------------------------------------------------
        // KULLANICININ SEPETİNİ BUL
        // --------------------------------------------------------

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart == null)
        {
            return Fail(
                "Sepet bulunamadı.");
        }

        if (cart.Items.Count == 0)
        {
            return Fail(
                "Sepet boş.");
        }

        // --------------------------------------------------------
        // GERÇEK SEPET TOPLAMINI BACKEND HESAPLAR
        // --------------------------------------------------------

        decimal cartTotal = 0;

        foreach (var item in cart.Items)
        {
            cartTotal +=
                item.Quantity *
                item.Product.Price;
        }

        // --------------------------------------------------------
        // KUPONU BUL
        // --------------------------------------------------------

        var coupon = await _context.Coupons
            .FirstOrDefaultAsync(
                x => x.Code == code,
                cancellationToken);

        if (coupon == null)
        {
            return Fail(
                "Kupon bulunamadı.");
        }

        // --------------------------------------------------------
        // AKTİFLİK KONTROLÜ
        // --------------------------------------------------------

        if (!coupon.IsActive)
        {
            return Fail(
                "Bu kupon aktif değil.");
        }

        // --------------------------------------------------------
        // TARİH KONTROLÜ
        // --------------------------------------------------------

        var now = DateTime.UtcNow;

        if (now < coupon.StartDate)
        {
            return Fail(
                "Bu kupon henüz kullanıma açılmadı.");
        }

        if (now > coupon.EndDate)
        {
            return Fail(
                "Bu kuponun kullanım süresi dolmuş.");
        }

        // --------------------------------------------------------
        // KULLANIM LİMİTİ
        // --------------------------------------------------------

        if (coupon.UsageLimit.HasValue &&
            coupon.UsedCount >= coupon.UsageLimit.Value)
        {
            return Fail(
                "Bu kuponun kullanım limiti dolmuş.");
        }

        // --------------------------------------------------------
        // MİNİMUM SEPET TUTARI
        // --------------------------------------------------------
        Console.WriteLine(
            $"[KUPON DEBUG] CartTotal: {cartTotal} | " +
            $"MinimumCartAmount: {coupon.MinimumCartAmount} | " +
            $"Code: {coupon.Code}"
        );
        if (cartTotal < coupon.MinimumCartAmount)
        {
            return Fail(
                $"Bu kupon için minimum sepet tutarı " +
                $"{coupon.MinimumCartAmount:C} olmalıdır.");
        }

        // --------------------------------------------------------
        // İNDİRİM HESAPLA
        // --------------------------------------------------------

        decimal discountAmount;

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

        // İndirim sepet toplamından büyük olamaz.
        if (discountAmount > cartTotal)
        {
            discountAmount = cartTotal;
        }

        discountAmount = Math.Round(
            discountAmount,
            2);

        var finalAmount = Math.Round(
            cartTotal - discountAmount,
            2);

        // --------------------------------------------------------
        // BAŞARILI SONUÇ
        // --------------------------------------------------------

        return new ApplyCouponResponseDto
        {
            Success = true,

            Message =
                "Kupon başarıyla uygulandı.",

            CouponCode =
                coupon.Code,

            DiscountAmount =
                discountAmount,

            FinalAmount =
                finalAmount
        };
    }

    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private static CouponResponseDto MapToDto(
        Coupon coupon)
    {
        return new CouponResponseDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinimumCartAmount = coupon.MinimumCartAmount,
            UsageLimit = coupon.UsageLimit,
            UsedCount = coupon.UsedCount,
            StartDate = coupon.StartDate,
            EndDate = coupon.EndDate,
            IsActive = coupon.IsActive,
            CreatedAt = coupon.CreatedAt
        };
    }

    // ============================================================
    // BAŞARISIZ KUPON SONUCU
    // ============================================================

    private static ApplyCouponResponseDto Fail(
        string message)
    {
        return new ApplyCouponResponseDto
        {
            Success = false,
            Message = message,
            CouponCode = string.Empty,
            DiscountAmount = 0,
            FinalAmount = 0
        };
    }
}
