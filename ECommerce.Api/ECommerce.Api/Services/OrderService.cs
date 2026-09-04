using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Order;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class OrderService : IOrderService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContext _userContext;

    public OrderService(
        ApplicationDbContext context,
        IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<List<OrderDto>> GetUserOrdersAsync(
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders
            .Select(MapToDto)
            .ToList();
    }

    public async Task<OrderDto> GetByIdAsync(
        int orderId,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                o => o.Id == orderId &&
                     o.UserId == userId,
                cancellationToken);

        if (order is null)
        {
            throw new KeyNotFoundException(
                "Sipariş bulunamadı.");
        }

        return MapToDto(order);
    }

    public async Task<List<OrderDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        return orders
            .Select(MapToDto)
            .ToList();
    }

    public async Task<OrderDto> UpdateStatusAsync(
        int orderId,
        string status,
        CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OrderStatus>(
                status,
                ignoreCase: false,
                out var orderStatus))
        {
            throw new ArgumentException(
                "Geçersiz sipariş durumu.");
        }

        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                o => o.Id == orderId,
                cancellationToken);

        if (order is null)
        {
            throw new KeyNotFoundException(
                "Sipariş bulunamadı.");
        }

        order.Status = orderStatus;

        await _context.SaveChangesAsync(
            cancellationToken);

        return MapToDto(order);
    }

    private static OrderDto MapToDto(
        Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalPrice = order.TotalPrice,

            Status = order.Status.ToString(),

            CreatedAt = order.CreatedAt,

            Items = order.Items
                .Select(item => new OrderItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice =
                        item.Quantity *
                        item.UnitPrice
                })
                .ToList()
        };
    }
}
