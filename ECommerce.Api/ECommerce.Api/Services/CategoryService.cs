
using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Category;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly ApplicationDbContext _context;

    public CategoryService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Categories
            .AsNoTracking()
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                CreatedAt = category.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(
                category => category.Id == id,
                cancellationToken);

        if (category is null)
        {
            throw new KeyNotFoundException(
                "Kategori bulunamadı.");
        }

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task<CategoryDto> CreateAsync(
        CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description
        };

        await _context.Categories.AddAsync(
            category,
            cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task<CategoryDto> UpdateAsync(
        int id,
        UpdateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(
                category => category.Id == id,
                cancellationToken);

        if (category is null)
        {
            throw new KeyNotFoundException(
                "Kategori bulunamadı.");
        }

        category.Name = dto.Name;
        category.Description = dto.Description;

        await _context.SaveChangesAsync(
            cancellationToken);

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task DeleteAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(
                category => category.Id == id,
                cancellationToken);

        if (category is null)
        {
            throw new KeyNotFoundException(
                "Kategori bulunamadı.");
        }

        _context.Categories.Remove(category);

        await _context.SaveChangesAsync(
            cancellationToken);
    }
}
