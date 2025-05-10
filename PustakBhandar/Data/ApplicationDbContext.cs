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
        public DbSet<Session> Sessions { get; set; }
        // Removed Wishlist, WishlistItem

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
        }
    }
} 