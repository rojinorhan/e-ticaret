using ECommerce.Api.DTOs.Category;
using ECommerce.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var categories = await _categoryService
            .GetAllAsync(cancellationToken);

        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService
            .GetByIdAsync(id, cancellationToken);

        return Ok(category);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService
            .CreateAsync(dto, cancellationToken);

        return Ok(category);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        UpdateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = await _categoryService
            .UpdateAsync(
                id,
                dto,
                cancellationToken);

        return Ok(category);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        int id,
        CancellationToken cancellationToken)
    {
        await _categoryService.DeleteAsync(
            id,
            cancellationToken);

        return NoContent();
    }
}