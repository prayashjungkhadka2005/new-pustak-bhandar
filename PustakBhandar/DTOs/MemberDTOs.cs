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

    public class CartItemResponse
    {
        public string Id { get; set; } = string.Empty;
        public string BookId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? CoverImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
        public DateTime AddedAt { get; set; }
    }

    public class CartResponse
    {
        public string Id { get; set; } = string.Empty;
        public List<CartItemResponse> Items { get; set; } = new List<CartItemResponse>();
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AddToCartRequest
    {
        [Required]
        public string BookId { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class UpdateCartItemRequest
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }
    }

    public class ClaimCodeResponseDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string ClaimCode { get; set; } = string.Empty;
    }

    public class OrderHistoryItemDto
    {
        public string Id { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountApplied { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ClaimCode { get; set; } = string.Empty;
        public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
    }

    public class PlaceOrderResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal DiscountApplied { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ClaimCode { get; set; } = string.Empty;
        public List<OrderItemResponseDto> Items { get; set; } = new List<OrderItemResponseDto>();
    }
} 