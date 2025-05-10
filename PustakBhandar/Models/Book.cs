using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Book
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [StringLength(20)] // Standard ISBN length (ISBN-13)
        public string ISBN { get; set; } = string.Empty;

        // Foreign Keys - Assuming these IDs map to other entities
        [Required]
        public string AuthorId { get; set; } = string.Empty;
        [ForeignKey("AuthorId")]
        public virtual Author? Author { get; set; }

        [Required]
        public string GenreId { get; set; } = string.Empty;
        [ForeignKey("GenreId")]
        public virtual Genre? Genre { get; set; }

        [Required]
        public string PublisherId { get; set; } = string.Empty;
        [ForeignKey("PublisherId")]
        public virtual Publisher? Publisher { get; set; }

        [StringLength(50)]
        public string Format { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Required]
        public DateTime PublicationDate { get; set; }

        [Required]
        public int Quantity { get; set; } // Renamed from StockQuantity for consistency with ApplicationDbContext
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow; // Added for consistency with ApplicationDbContext

        [Column(TypeName = "decimal(2, 1)")]
        public decimal Rating { get; set; }
        public bool OnSale { get; set; }

        public string? DiscountId { get; set; }
        [ForeignKey("DiscountId")]
        public virtual Discount? Discount { get; set; }

        // Navigation properties for relationships
        public virtual ICollection<Wishlist>? WishlistEntries { get; set; } = new List<Wishlist>();
        public virtual ICollection<CartItem>? CartItems { get; set; } = new List<CartItem>();

        // Navigation property for Reviews
        public virtual ICollection<Review>? Reviews { get; set; } = new List<Review>();
        
        // Navigation property for OrderItems (if you have an OrderItem join table)
        // public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
