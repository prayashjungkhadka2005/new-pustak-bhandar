using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Models;
using Microsoft.AspNetCore.Identity;

namespace PustakBhandar.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Book> Books { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Author> Authors { get; set; }
        public DbSet<Genre> Genres { get; set; }
        public DbSet<Publisher> Publishers { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<MemberDiscount> MemberDiscounts { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Wishlist> Wishlists { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure Session
            builder.Entity<Session>(entity =>
            {
                entity.HasKey(s => s.Id);
                entity.Property(s => s.UserId).IsRequired();
                entity.Property(s => s.ExpiresAt).IsRequired();
                entity.Property(s => s.IsActive).IsRequired();
            });

            // Configure ApplicationUser
            builder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.FullName).HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            });

            // Configure Book
            builder.Entity<Book>(entity =>
            {
                entity.HasOne(b => b.Author)
                    .WithMany(a => a.Books)
                    .HasForeignKey(b => b.AuthorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Genre)
                    .WithMany(g => g.Books)
                    .HasForeignKey(b => b.GenreId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Publisher)
                    .WithMany(p => p.Books)
                    .HasForeignKey(b => b.PublisherId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Discount)
                    .WithMany(d => d.Books)
                    .HasForeignKey(b => b.DiscountId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // Configure Review
            builder.Entity<Review>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.BookId).IsRequired();
                entity.Property(r => r.MemberId).IsRequired();
                entity.Property(r => r.Rating).IsRequired();
                entity.Property(r => r.ReviewDate).IsRequired();
            });

            // Configure Notification
            builder.Entity<Notification>(entity =>
            {
                entity.HasKey(n => n.Id);
                entity.Property(n => n.MemberId).IsRequired();
                entity.Property(n => n.OrderId).IsRequired();
                entity.Property(n => n.Message).IsRequired().HasMaxLength(500);
                entity.Property(n => n.Timestamp).IsRequired();
            });

            // Configure Wishlist
            builder.Entity<Wishlist>(entity =>
            {
                entity.HasKey(w => w.Id);
                entity.HasOne(w => w.Member)
                    .WithMany(m => m.Wishlist)
                    .HasForeignKey(w => w.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(w => w.Book)
                    .WithMany(b => b.WishlistEntries)
                    .HasForeignKey(w => w.BookId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
} 