
using ECommerce.Api.DTOs.Payment;

namespace ECommerce.Api.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponseDto> ProcessPaymentAsync(
        PaymentRequestDto dto,
        CancellationToken cancellationToken = default);
}