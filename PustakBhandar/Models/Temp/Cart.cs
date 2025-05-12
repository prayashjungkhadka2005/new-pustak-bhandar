using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Cart
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual AspNetUser User { get; set; } = null!;
}
