using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class MemberDiscount
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string MemberId { get; set; } = string.Empty;
        [ForeignKey("MemberId")]
        public virtual Member? Member { get; set; }

        [Required]
        public string DiscountId { get; set; } = string.Empty;
        [ForeignKey("DiscountId")]
        public virtual Discount? Discount { get; set; }

        public bool IsStackable { get; set; }
        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; }
    }
} 