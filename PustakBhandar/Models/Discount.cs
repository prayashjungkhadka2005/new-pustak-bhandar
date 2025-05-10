using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Discount
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string AdminId { get; set; } = string.Empty; // ID of the Admin who created it
        [ForeignKey("AdminId")]
        public virtual Admin? Admin { get; set; }

        [Required]
        [Column(TypeName = "text")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(5, 2)")] // e.g., 10.50 for 10.50%
        public decimal Percentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property for Books this Discount applies to
        public virtual ICollection<Book>? Books { get; set; } = new List<Book>();

        // Navigation property for MemberDiscounts using this Discount
        public virtual ICollection<MemberDiscount>? MemberDiscounts { get; set; } = new List<MemberDiscount>();
    }
} 