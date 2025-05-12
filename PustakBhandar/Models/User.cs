using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace PustakBhandar.Models
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public string FullName { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
        public DateTime RefreshTokenExpiryTime { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Cart? Cart { get; set; }
        public virtual Wishlist? Wishlist { get; set; }
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }

    public class Member : ApplicationUser
    {
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public int TotalOrders { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal DiscountEarned { get; set; }

        // Member-specific collections
        public virtual ICollection<Wishlist>? WishlistEntries { get; set; } = new List<Wishlist>();
        public virtual ICollection<CartItem>? CartItems { get; set; } = new List<CartItem>();
    }

    public class Admin : ApplicationUser
    {
        // Admin-specific properties can be added here if any
    }

    public class Staff : ApplicationUser
    {
        // Staff-specific properties can be added here if any
    }
} 