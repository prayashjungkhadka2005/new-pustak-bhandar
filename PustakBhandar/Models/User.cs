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

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Member : ApplicationUser
    {
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;
        public int TotalOrders { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal DiscountEarned { get; set; }

        // Assuming Whitelist, Cart, and Orders store Book Ids.
        // These will be navigation properties to Book entities.
        // We will need join tables for many-to-many relationships if a Book can be in multiple Carts/Orders/Whitelists
        // or a User can have multiple instances of the same book in different contexts.
        // For simplicity, let's assume direct navigation for now, and refine later.
        public virtual ICollection<Wishlist>? WishlistEntries { get; set; } = new List<Wishlist>();
        public virtual ICollection<CartItem>? CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<Order>? Orders { get; set; } = new List<Order>();
        public virtual ICollection<Review>? Reviews { get; set; } = new List<Review>();
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