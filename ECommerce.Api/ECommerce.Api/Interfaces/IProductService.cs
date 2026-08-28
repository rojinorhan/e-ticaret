using ECommerce.Api.DTOs.Product;

namespace ECommerce.Api.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<ProductDto?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<ProductDto> CreateAsync(
        CreateProductDto dto,
        CancellationToken cancellationToken);

    Task<ProductDto?> UpdateAsync(
        int id,
        UpdateProductDto dto,
        CancellationToken cancellationToken);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken);
}