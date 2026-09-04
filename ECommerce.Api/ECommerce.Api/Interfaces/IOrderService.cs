
using ECommerce.Api.DTOs.Order;

namespace ECommerce.Api.Interfaces;

public interface IOrderService
{
    Task<List<OrderDto>> GetUserOrdersAsync(
        CancellationToken cancellationToken);

    Task<OrderDto> GetByIdAsync(
        int orderId,
        CancellationToken cancellationToken);

    Task<List<OrderDto>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<OrderDto> UpdateStatusAsync(
        int orderId,
        string status,
        CancellationToken cancellationToken);
}
