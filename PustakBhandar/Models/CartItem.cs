using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class CartItem // Renamed from Cart, represents an item in a member's cart
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MemberId { get; set; } = string.Empty;
        [ForeignKey("MemberId")]
        public virtual Member? Member { get; set; }

        [Required]
        public string BookId { get; set; } = string.Empty;
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        [Required]
        public int Quantity { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
} 