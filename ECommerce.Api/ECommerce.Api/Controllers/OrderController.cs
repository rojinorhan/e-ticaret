using ECommerce.Api.DTOs.Order;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _orderService.CreateAsync(
                cancellationToken));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _orderService.GetUserOrdersAsync(
                cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        return Ok(
            await _orderService.GetByIdAsync(
                id,
                cancellationToken));
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _orderService.GetAllAsync(
                cancellationToken));
    }

    [HttpPut("admin/{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(
        int id,
        UpdateOrderStatusDto dto,
        CancellationToken cancellationToken)
    {
        return Ok(
            await _orderService.UpdateStatusAsync(
                id,
                dto.Status,
                cancellationToken));
    }
}