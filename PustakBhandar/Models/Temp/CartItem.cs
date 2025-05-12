using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class CartItem
{
    public string Id { get; set; } = null!;

    public string? MemberId { get; set; }

    public string BookId { get; set; } = null!;

    public int Quantity { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string CartId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public decimal Price { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual Cart Cart { get; set; } = null!;

    public virtual AspNetUser? Member { get; set; }
}
