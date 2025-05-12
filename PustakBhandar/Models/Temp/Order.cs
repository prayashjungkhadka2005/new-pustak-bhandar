using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Order
{
    public string Id { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public DateTime OrderDate { get; set; }

    public decimal TotalAmount { get; set; }

    public decimal DiscountApplied { get; set; }

    public string ClaimCode { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string? ProcessedByStaffId { get; set; }

    public string? AdminId { get; set; }

    public virtual AspNetUser? Admin { get; set; }

    public virtual AspNetUser Member { get; set; } = null!;

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual AspNetUser? ProcessedByStaff { get; set; }
}
