using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Wishlist
{
    public string Id { get; set; } = null!;

    public string? MemberId { get; set; }

    public string BookId { get; set; } = null!;

    public DateTime AddedAt { get; set; }

    public string UserId { get; set; } = null!;

    public virtual Book Book { get; set; } = null!;

    public virtual AspNetUser? Member { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
