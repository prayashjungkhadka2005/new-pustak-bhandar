using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Announcement
{
    public string Id { get; set; } = null!;

    public string AdminId { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string Type { get; set; } = null!;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual AspNetUser Admin { get; set; } = null!;
}
