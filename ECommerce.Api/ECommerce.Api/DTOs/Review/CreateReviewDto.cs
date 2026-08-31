namespace ECommerce.Api.DTOs.Review;

public class CreateReviewDto
{
    public int ProductId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;
}