using ECommerce.Api.DTOs.Payment;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost]
    public async Task<ActionResult<PaymentResponseDto>> ProcessPayment(
        [FromBody] PaymentRequestDto dto,
        CancellationToken cancellationToken)
    {
        var result = await _paymentService.ProcessPaymentAsync(
            dto,
            cancellationToken);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}