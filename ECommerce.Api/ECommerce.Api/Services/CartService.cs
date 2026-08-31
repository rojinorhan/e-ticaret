
using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class CartService : ICartService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserContext _userContext;

    public CartService(
        ApplicationDbContext context,
        IUserContext userContext)
    {
        _context = context;
        _userContext = userContext;
    }

    public async Task<CartDto> GetCartAsync(
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
            cart = new Cart
            {
                UserId = userId
            };

            _context.Carts.Add(cart);

            await _context.SaveChangesAsync(
                cancellationToken);
        }

        return MapToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(
        AddCartItemDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        if (dto.Quantity <= 0)
        {
            throw new ArgumentException(
                "Ürün miktarı 0'dan büyük olmalıdır.");
        }

        var product = await _context.Products
            .FirstOrDefaultAsync(
                p => p.Id == dto.ProductId,
                cancellationToken);

        if (product is null)
        {
            throw new KeyNotFoundException(
                "Ürün bulunamadı.");
        }

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            cart = new Cart
            {
                UserId = userId
            };

            _context.Carts.Add(cart);
        }

        var existingItem = cart.Items
            .FirstOrDefault(i =>
                i.ProductId == dto.ProductId);

        var newQuantity = dto.Quantity;

        if (existingItem is not null)
        {
            newQuantity =
                existingItem.Quantity + dto.Quantity;
        }

        if (newQuantity > product.Stock)
        {
            throw new InvalidOperationException(
                $"Yetersiz stok. Mevcut stok: {product.Stock}");
        }

        if (existingItem is not null)
        {
            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = product.Price;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = product.Id,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            });
        }

        await _context.SaveChangesAsync(
            cancellationToken);

        await _context.Entry(cart)
            .Collection(c => c.Items)
            .Query()
            .Include(i => i.Product)
            .LoadAsync(cancellationToken);

        return MapToDto(cart);
    }

    public async Task<CartDto> UpdateItemAsync(
        int cartItemId,
        UpdateCartItemDto dto,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        if (dto.Quantity <= 0)
        {
            throw new ArgumentException(
                "Ürün miktarı 0'dan büyük olmalıdır.");
        }

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            throw new KeyNotFoundException(
                "Sepet bulunamadı.");
        }

        var item = cart.Items
            .FirstOrDefault(i => i.Id == cartItemId);

        if (item is null)
        {
            throw new KeyNotFoundException(
                "Sepet ürünü bulunamadı.");
        }

        if (dto.Quantity > item.Product.Stock)
        {
            throw new InvalidOperationException(
                $"Yetersiz stok. Mevcut stok: {item.Product.Stock}");
        }

        item.Quantity = dto.Quantity;
        item.UnitPrice = item.Product.Price;

        await _context.SaveChangesAsync(
            cancellationToken);

        return MapToDto(cart);
    }

    public async Task RemoveItemAsync(
        int cartItemId,
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var cart = await _context.Carts
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            throw new KeyNotFoundException(
                "Sepet bulunamadı.");
        }

        var item = await _context.CartItems
            .FirstOrDefaultAsync(
                i => i.Id == cartItemId &&
                     i.CartId == cart.Id,
                cancellationToken);

        if (item is null)
        {
            throw new KeyNotFoundException(
                "Sepet ürünü bulunamadı.");
        }

        _context.CartItems.Remove(item);

        await _context.SaveChangesAsync(
            cancellationToken);
    }

    public async Task ClearCartAsync(
        CancellationToken cancellationToken)
    {
        var userId = _userContext.UserId;

        var cart = await _context.Carts
            .FirstOrDefaultAsync(
                c => c.UserId == userId,
                cancellationToken);

        if (cart is null)
        {
            throw new KeyNotFoundException(
                "Sepet bulunamadı.");
        }

        var items = await _context.CartItems
            .Where(i => i.CartId == cart.Id)
            .ToListAsync(cancellationToken);

        if (items.Count > 0)
        {
            _context.CartItems.RemoveRange(items);

            await _context.SaveChangesAsync(
                cancellationToken);
        }
    }

    private static CartDto MapToDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            CreatedAt = cart.CreatedAt,

            Items = cart.Items
                .Select(item => new CartItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    Quantity = item.Quantity,
                    Stock = item.Product.Stock,
                    UnitPrice = item.UnitPrice,
                    TotalPrice =
                        item.Quantity * item.UnitPrice
                })
                .ToList()
        };
    }
}