using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.DTOs
{
    public class AdminOrderResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string MemberName { get; set; } = string.Empty;
        public string MemberEmail { get; set; } = string.Empty;
        public string ClaimCode { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public decimal DiscountApplied { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string? ProcessedByStaffId { get; set; }
        public string? ProcessedByStaffName { get; set; }
        public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
    }

    public class AdminMemberResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime JoinDate { get; set; }
        public int TotalOrders { get; set; }
        public decimal DiscountEarned { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class InventoryResponseDto
    {
        public string BookId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string GenreName { get; set; } = string.Empty;
        public string PublisherName { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public bool OnSale { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class UpdateInventoryDto
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }

        public bool? OnSale { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? Price { get; set; }
    }
} 