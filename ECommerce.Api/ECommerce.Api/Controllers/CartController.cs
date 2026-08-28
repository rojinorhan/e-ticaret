
using ECommerce.Api.DTOs.Cart;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart(
        CancellationToken cancellationToken)
    {
        var cart = await _cartService.GetCartAsync(
            cancellationToken);

        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(
        AddCartItemDto dto,
        CancellationToken cancellationToken)
    {
        var cart = await _cartService.AddItemAsync(
            dto,
            cancellationToken);

        return Ok(cart);
    }

    [HttpPut("items/{cartItemId:int}")]
    public async Task<IActionResult> UpdateItem(
        int cartItemId,
        UpdateCartItemDto dto,
        CancellationToken cancellationToken)
    {
        var cart = await _cartService.UpdateItemAsync(
            cartItemId,
            dto,
            cancellationToken);

        return Ok(cart);
    }

    [HttpDelete("items/{cartItemId:int}")]
    public async Task<IActionResult> RemoveItem(
        int cartItemId,
        CancellationToken cancellationToken)
    {
        await _cartService.RemoveItemAsync(
            cartItemId,
            cancellationToken);

        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart(
        CancellationToken cancellationToken)
    {
        await _cartService.ClearCartAsync(
            cancellationToken);

        return NoContent();
    }
}
