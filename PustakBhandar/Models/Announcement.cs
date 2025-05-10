using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PustakBhandar.Models
{
    public class Announcement
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string AdminId { get; set; } = string.Empty; // ID of the Admin who created it
        [ForeignKey("AdminId")]
        public virtual Admin? Admin { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "text")]
        public string Message { get; set; } = string.Empty;

        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // Deal, NewArrival, Info

        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
} 