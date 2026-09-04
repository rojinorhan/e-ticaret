using ECommerce.Api.DTOs.Coupon;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponController : ControllerBase
{
    private readonly ICouponService _couponService;
    private readonly IUserContext _userContext;

    public CouponController(
        ICouponService couponService,
        IUserContext userContext)
    {
        _couponService = couponService;
        _userContext = userContext;
    }

    // ============================================================
    // TÜM KUPONLAR
    // ============================================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var coupons =
            await _couponService.GetAllAsync(
                cancellationToken);

        return Ok(coupons);
    }

    // ============================================================
    // ID'YE GÖRE KUPON
    // ============================================================

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var coupon =
            await _couponService.GetByIdAsync(
                id,
                cancellationToken);

        if (coupon == null)
        {
            return NotFound(new
            {
                message = "Kupon bulunamadı."
            });
        }

        return Ok(coupon);
    }

    // ============================================================
    // KUPON OLUŞTUR
    // ============================================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateCouponDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var coupon =
                await _couponService.CreateAsync(
                    dto,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = coupon.Id },
                coupon);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // KUPON GÜNCELLE
    // ============================================================

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCouponDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var coupon =
                await _couponService.UpdateAsync(
                    id,
                    dto,
                    cancellationToken);

            if (coupon == null)
            {
                return NotFound(new
                {
                    message = "Kupon bulunamadı."
                });
            }

            return Ok(coupon);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // KUPON SİL
    // ============================================================

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        var deleted =
            await _couponService.DeleteAsync(
                id,
                cancellationToken);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Kupon bulunamadı."
            });
        }

        return Ok(new
        {
            message = "Kupon başarıyla silindi."
        });
    }

    // ============================================================
    // KUPON UYGULA
    // ============================================================

    [HttpPost("apply")]
    [Authorize]
    public async Task<IActionResult> Apply(
        [FromBody] ApplyCouponDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            // JWT üzerinden giriş yapan kullanıcının ID'si alınır.
            var userId = _userContext.UserId;

            var result =
                await _couponService.ApplyAsync(
                    dto,
                    userId,
                    cancellationToken);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
    }
}
