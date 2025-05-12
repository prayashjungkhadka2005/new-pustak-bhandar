using System;
using System.Collections.Generic;

namespace PustakBhandar.Models.Temp;

public partial class Book
{
    public string Id { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Isbn { get; set; } = null!;

    public string AuthorId { get; set; } = null!;

    public string GenreId { get; set; } = null!;

    public string PublisherId { get; set; } = null!;

    public string Format { get; set; } = null!;

    public decimal Price { get; set; }

    public DateTime PublicationDate { get; set; }

    public int Quantity { get; set; }

    public DateTime CreatedAt { get; set; }

    public decimal Rating { get; set; }

    public bool OnSale { get; set; }

    public string? DiscountId { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Author Author { get; set; } = null!;

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Discount? Discount { get; set; }

    public virtual Genre Genre { get; set; } = null!;

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual Publisher Publisher { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
