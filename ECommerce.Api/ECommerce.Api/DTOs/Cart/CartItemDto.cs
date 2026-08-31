namespace ECommerce.Api.DTOs.Cart;

public class CartItemDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public int Stock { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal TotalPrice { get; set; }
}