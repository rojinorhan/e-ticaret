using ECommerce.Api.Data;
using ECommerce.Api.Data.Entities;
using ECommerce.Api.DTOs.Product;
using ECommerce.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Api.Services;

public class ProductService : IProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Select(product => new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                CreatedAt = product.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.Id == id)
            .Select(product => new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = product.Category.Name,
                CreatedAt = product.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductDto> CreateAsync(
        CreateProductDto dto,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException(
                "Ürün adı boş olamaz.",
                nameof(dto.Name));
        }

        if (dto.Price <= 0)
        {
            throw new ArgumentException(
                "Ürün fiyatı 0'dan büyük olmalıdır.",
                nameof(dto.Price));
        }

        if (dto.Stock < 0)
        {
            throw new ArgumentException(
                "Stok miktarı negatif olamaz.",
                nameof(dto.Stock));
        }

        var categoryExists = await _context.Categories
            .AnyAsync(
                category => category.Id == dto.CategoryId,
                cancellationToken);

        if (!categoryExists)
        {
            throw new KeyNotFoundException(
                "Belirtilen kategori bulunamadı.");
        }

        var product = new Product
        {
            Name = dto.Name.Trim(),
            Description = dto.Description.Trim(),
            Price = dto.Price,
            Stock = dto.Stock,
            CategoryId = dto.CategoryId
        };

        await _context.Products.AddAsync(
            product,
            cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(
            product.Id,
            cancellationToken)
            ?? throw new InvalidOperationException(
                "Ürün oluşturuldu ancak getirilemedi.");
    }

    public async Task<ProductDto?> UpdateAsync(
        int id,
        UpdateProductDto dto,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new ArgumentException(
                "Ürün adı boş olamaz.",
                nameof(dto.Name));
        }

        if (dto.Price <= 0)
        {
            throw new ArgumentException(
                "Ürün fiyatı 0'dan büyük olmalıdır.",
                nameof(dto.Price));
        }

        if (dto.Stock < 0)
        {
            throw new ArgumentException(
                "Stok miktarı negatif olamaz.",
                nameof(dto.Stock));
        }

        var product = await _context.Products
            .FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken);

        if (product is null)
        {
            return null;
        }

        var categoryExists = await _context.Categories
            .AnyAsync(
                category => category.Id == dto.CategoryId,
                cancellationToken);

        if (!categoryExists)
        {
            throw new KeyNotFoundException(
                "Belirtilen kategori bulunamadı.");
        }

        product.Name = dto.Name.Trim();
        product.Description = dto.Description.Trim();
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(
            product.Id,
            cancellationToken);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(
                product => product.Id == id,
                cancellationToken);

        if (product is null)
        {
            return false;
        }

        _context.Products.Remove(product);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
    
public async Task<List<ProductDto>> FilterAsync(
    string? search,
    int? categoryId,
    decimal? minPrice,
    decimal? maxPrice,
    string? sort,
    CancellationToken cancellationToken)
{
    var query = _context.Products
        .AsNoTracking()
        .Include(p => p.Category)
        .AsQueryable();


    if (!string.IsNullOrWhiteSpace(search))
    {
        search = search.Trim();

        query = query.Where(p =>
            p.Name.Contains(search) ||
            (p.Description != null &&
             p.Description.Contains(search)));
    }

    if (categoryId.HasValue)
    {
        query = query.Where(p =>
            p.CategoryId == categoryId.Value);
    }

    if (minPrice.HasValue)
    {
        query = query.Where(p =>
            p.Price >= minPrice.Value);
    }

  
    if (maxPrice.HasValue)
    {
        query = query.Where(p =>
            p.Price <= maxPrice.Value);
    }


    var products = await query
        .Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            CategoryId = p.CategoryId,
            CategoryName = p.Category.Name,
            CreatedAt = p.CreatedAt
        })
        .ToListAsync(cancellationToken);


    products = sort switch
    {
        "priceAsc" =>
            products
                .OrderBy(p => p.Price)
                .ToList(),

        "priceDesc" =>
            products
                .OrderByDescending(p => p.Price)
                .ToList(),

        "nameAsc" =>
            products
                .OrderBy(p => p.Name)
                .ToList(),

        "nameDesc" =>
            products
                .OrderByDescending(p => p.Name)
                .ToList(),

        _ =>
            products
                .OrderByDescending(p => p.Id)
                .ToList()
    };

    return products;
}

}
