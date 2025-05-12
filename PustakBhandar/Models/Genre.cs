using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace PustakBhandar.Models
{
    public class Genre
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        // Navigation property for Books in this Genre
        public virtual ICollection<Book>? Books { get; set; } = new List<Book>();
    }
}