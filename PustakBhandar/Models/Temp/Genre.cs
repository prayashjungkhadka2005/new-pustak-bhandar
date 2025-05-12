using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Genre
{
    public string Id { get; set; } = null!;

    public string Name { get; set; } = null!;

    public virtual ICollection<Book> Books { get; set; } = new List<Book>();
}
