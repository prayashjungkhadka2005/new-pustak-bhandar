using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class MemberDiscount
{
    public string Id { get; set; } = null!;

    public string MemberId { get; set; } = null!;

    public string DiscountId { get; set; } = null!;

    public bool IsStackable { get; set; }

    public DateTime AppliedDate { get; set; }

    public bool IsActive { get; set; }

    public virtual Discount Discount { get; set; } = null!;

    public virtual AspNetUser Member { get; set; } = null!;
}
