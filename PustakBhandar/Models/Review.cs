using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Review
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string BookId { get; set; } = string.Empty;
        [ForeignKey("BookId")]
        public virtual Book? Book { get; set; }

        [Required]
        public string MemberId { get; set; } = string.Empty;
        [ForeignKey("MemberId")]
        public virtual Member? Member { get; set; }

        [Required]
        [Range(1, 5)] // Assuming a 1-5 star rating
        public int Rating { get; set; }

        [Column(TypeName = "text")]
        public string? Comment { get; set; }

        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    }
} 