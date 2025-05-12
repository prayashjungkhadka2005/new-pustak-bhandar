using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Session
{
    public string Id { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime ExpiresAt { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual AspNetUser User { get; set; } = null!;
}
