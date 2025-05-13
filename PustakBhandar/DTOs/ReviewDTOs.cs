using System.ComponentModel.DataAnnotations;

namespace PustakBhandar.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public string BookId { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }
    }

    public class ReviewResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime ReviewDate { get; set; }
    }
} 