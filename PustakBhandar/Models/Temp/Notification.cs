using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Notification
{
    public string Id { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public string Message { get; set; } = null!;

    public DateTime Timestamp { get; set; }

    public bool IsRead { get; set; }

    public string? AdminId { get; set; }

    public string? StaffId { get; set; }

    public virtual AspNetUser? Admin { get; set; }

    public virtual AspNetUser Member { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual AspNetUser? Staff { get; set; }
}
