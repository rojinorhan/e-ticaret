
using ECommerce.Api.DTOs.Category;

namespace ECommerce.Api.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(
        CancellationToken cancellationToken);

    Task<CategoryDto> GetByIdAsync(
        int id,
        CancellationToken cancellationToken);

    Task<CategoryDto> CreateAsync(
        CreateCategoryDto dto,
        CancellationToken cancellationToken);

    Task<CategoryDto> UpdateAsync(
        int id,
        UpdateCategoryDto dto,
        CancellationToken cancellationToken);

    Task DeleteAsync(
        int id,
        CancellationToken cancellationToken);
}
