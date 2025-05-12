using System.ComponentModel.DataAnnotations;

namespace PustakBhandar.DTOs
{
    public class WishlistItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? CoverImageUrl { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class AddToWishlistRequest
    {
        [Required]
        public string BookId { get; set; } = string.Empty;
    }
} 