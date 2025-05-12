using System.ComponentModel.DataAnnotations;

namespace PustakBhandar.DTOs
{
    public class CreateBookDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ISBN { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string GenreName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string PublisherName { get; set; } = string.Empty;

        [StringLength(50)]
        public string Format { get; set; } = string.Empty;

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public DateTime PublicationDate { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public bool OnSale { get; set; }
        public string? DiscountId { get; set; }

        // Obsolete: For backward compatibility
        [Obsolete("Use AuthorName instead.")]
        public string? AuthorId { get; set; }
        [Obsolete("Use GenreName instead.")]
        public string? GenreId { get; set; }
        [Obsolete("Use PublisherName instead.")]
        public string? PublisherId { get; set; }
    }

    public class UpdateBookDto
    {
        [StringLength(200)]
        public string? Title { get; set; }

        [StringLength(20)]
        public string? ISBN { get; set; }

        [StringLength(100)]
        public string? AuthorName { get; set; }
        [StringLength(100)]
        public string? GenreName { get; set; }
        [StringLength(100)]
        public string? PublisherName { get; set; }

        [StringLength(50)]
        public string? Format { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }

        public DateTime? PublicationDate { get; set; }

        [Range(0, int.MaxValue)]
        public int? Quantity { get; set; }

        public bool? OnSale { get; set; }
        public string? DiscountId { get; set; }

        // Obsolete: For backward compatibility
        [Obsolete("Use AuthorName instead.")]
        public string? AuthorId { get; set; }
        [Obsolete("Use GenreName instead.")]
        public string? GenreId { get; set; }
        [Obsolete("Use PublisherName instead.")]
        public string? PublisherId { get; set; }
    }

    public class BookResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string GenreName { get; set; } = string.Empty;
        public string PublisherName { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime PublicationDate { get; set; }
        public int Quantity { get; set; }
        public decimal Rating { get; set; }
        public bool OnSale { get; set; }
        public string? DiscountId { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 