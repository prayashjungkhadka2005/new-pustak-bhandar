using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Review
{
    public string Id { get; set; } = null!;

    public string BookId { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public int Rating { get; set; }

    public string? Comment { get; set; }

    public DateTime ReviewDate { get; set; }

    public string? AdminId { get; set; }

    public string? StaffId { get; set; }

    public virtual AspNetUser? Admin { get; set; }

    public virtual Book Book { get; set; } = null!;

    public virtual AspNetUser Member { get; set; } = null!;

    public virtual AspNetUser? Staff { get; set; }
}
