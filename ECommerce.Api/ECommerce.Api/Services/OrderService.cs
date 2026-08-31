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

    public async Task<OrderDto> CreateAsync(
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            throw new InvalidOperationException(
                "Sepet bulunamadı.");
        }

        if (cart.Items.Count == 0)
        {
            throw new InvalidOperationException(
                "Sepet boş.");
        }

        foreach (var cartItem in cart.Items)
        {
            if (cartItem.Quantity > cartItem.Product.Stock)
            {
                throw new InvalidOperationException(
                    $"Yetersiz stok: {cartItem.Product.Name}. " +
                    $"Mevcut stok: {cartItem.Product.Stock}");
            }
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        decimal totalPrice = 0;

        foreach (var cartItem in cart.Items)
        {
            var orderItem = new OrderItem
            {
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.Product.Price
            };

            order.Items.Add(orderItem);

            totalPrice +=
                cartItem.Quantity *
                cartItem.Product.Price;

            cartItem.Product.Stock -=
                cartItem.Quantity;
        }

        order.TotalPrice = totalPrice;

        _context.Orders.Add(order);

        _context.CartItems.RemoveRange(
            cart.Items);

        await _context.SaveChangesAsync(
            cancellationToken);

        await _context.Entry(order)
            .Collection(o => o.Items)
            .Query()
            .Include(i => i.Product)
            .LoadAsync(cancellationToken);

        return MapToDto(order);
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