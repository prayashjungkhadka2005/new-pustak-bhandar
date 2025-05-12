using System.ComponentModel.DataAnnotations;

namespace PustakBhandar.DTOs
{
    public class OrderItemResponseDto
    {
        public string BookId { get; set; } = string.Empty;
        public string BookTitle { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public decimal Subtotal { get; set; }
    }
} 