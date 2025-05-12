using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class AspNetUser
{
    public string Id { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string Discriminator { get; set; } = null!;

    public DateTime? JoinDate { get; set; }

    public int? TotalOrders { get; set; }

    public decimal? DiscountEarned { get; set; }

    public string? UserName { get; set; }

    public string? NormalizedUserName { get; set; }

    public string? Email { get; set; }

    public string? NormalizedEmail { get; set; }

    public bool EmailConfirmed { get; set; }

    public string? PasswordHash { get; set; }

    public string? SecurityStamp { get; set; }

    public string? ConcurrencyStamp { get; set; }

    public string? PhoneNumber { get; set; }

    public bool PhoneNumberConfirmed { get; set; }

    public bool TwoFactorEnabled { get; set; }

    public DateTime? LockoutEnd { get; set; }

    public bool LockoutEnabled { get; set; }

    public int AccessFailedCount { get; set; }

    public string RefreshToken { get; set; } = null!;

    public DateTime RefreshTokenExpiryTime { get; set; }

    public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    public virtual ICollection<AspNetUserClaim> AspNetUserClaims { get; set; } = new List<AspNetUserClaim>();

    public virtual ICollection<AspNetUserLogin> AspNetUserLogins { get; set; } = new List<AspNetUserLogin>();

    public virtual ICollection<AspNetUserToken> AspNetUserTokens { get; set; } = new List<AspNetUserToken>();

    public virtual Cart? Cart { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual ICollection<Discount> Discounts { get; set; } = new List<Discount>();

    public virtual ICollection<MemberDiscount> MemberDiscounts { get; set; } = new List<MemberDiscount>();

    public virtual ICollection<Notification> NotificationAdmins { get; set; } = new List<Notification>();

    public virtual ICollection<Notification> NotificationMembers { get; set; } = new List<Notification>();

    public virtual ICollection<Notification> NotificationStaffs { get; set; } = new List<Notification>();

    public virtual ICollection<Order> OrderAdmins { get; set; } = new List<Order>();

    public virtual ICollection<Order> OrderMembers { get; set; } = new List<Order>();

    public virtual ICollection<Order> OrderProcessedByStaffs { get; set; } = new List<Order>();

    public virtual ICollection<Review> ReviewAdmins { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewMembers { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewStaffs { get; set; } = new List<Review>();

    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

    public virtual ICollection<Wishlist> WishlistMembers { get; set; } = new List<Wishlist>();

    public virtual Wishlist? WishlistUser { get; set; }

    public virtual ICollection<AspNetRole> Roles { get; set; } = new List<AspNetRole>();
}
