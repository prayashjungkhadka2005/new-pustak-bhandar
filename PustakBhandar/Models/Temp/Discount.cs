using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Discount
{
    public string Id { get; set; } = null!;

    public string AdminId { get; set; } = null!;

    public string Description { get; set; } = null!;

    public decimal Percentage { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual AspNetUser Admin { get; set; } = null!;

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();

    public virtual ICollection<MemberDiscount> MemberDiscounts { get; set; } = new List<MemberDiscount>();
}
