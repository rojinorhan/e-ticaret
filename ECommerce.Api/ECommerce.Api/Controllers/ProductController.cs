using ECommerce.Api.DTOs.Product;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _productService.GetAllAsync(
                cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        return Ok(
            await _productService.GetByIdAsync(
                id,
                cancellationToken));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        CreateProductDto dto,
        CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(
            dto,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = product.Id },
            product);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateProductDto dto,
        CancellationToken cancellationToken)
    {
        return Ok(
            await _productService.UpdateAsync(
                id,
                dto,
                cancellationToken));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        await _productService.DeleteAsync(
            id,
            cancellationToken);

        return NoContent();
    }
}