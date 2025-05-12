using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class OrderItem
{
    public int Id { get; set; }

    public string OrderId { get; set; } = null!;

    public string BookId { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
