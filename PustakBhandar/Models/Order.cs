using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Order
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MemberId { get; set; } = string.Empty;
        [ForeignKey("MemberId")]
        public virtual Member? Member { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal TotalAmount { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal DiscountApplied { get; set; }

        [Required]
        [StringLength(50)]
        public string ClaimCode { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed

        public string? ProcessedByStaffId { get; set; } // Staff ID
        [ForeignKey("ProcessedByStaffId")]
        public virtual Staff? ProcessedByStaff { get; set; }

        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string OrderId { get; set; } = string.Empty;
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [Required]
        public string BookId { get; set; } = string.Empty;
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }
    }
} 