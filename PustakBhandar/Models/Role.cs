using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace PustakBhandar.Models
{
    public class Role : IdentityRole
    {
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<ApplicationUser>? Users { get; set; } = new List<ApplicationUser>();
    }
} 