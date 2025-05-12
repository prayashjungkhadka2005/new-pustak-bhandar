using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Cart
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MemberId { get; set; } = string.Empty;
        [ForeignKey("MemberId")]
        public virtual Member? Member { get; set; }

        public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();

        [Column(TypeName = "decimal(10, 2)")]
        public decimal TotalAmount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 