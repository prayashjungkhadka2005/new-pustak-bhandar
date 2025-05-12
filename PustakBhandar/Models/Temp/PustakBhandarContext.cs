using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace PustakBhandar.Models.Temp;

public partial class PustakBhandarContext : DbContext
{
    public PustakBhandarContext()
    {
    }

    public PustakBhandarContext(DbContextOptions<PustakBhandarContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<AspNetRole> AspNetRoles { get; set; }

    public virtual DbSet<AspNetRoleClaim> AspNetRoleClaims { get; set; }

    public virtual DbSet<AspNetUser> AspNetUsers { get; set; }

    public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }

    public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }

    public virtual DbSet<AspNetUserToken> AspNetUserTokens { get; set; }

    public virtual DbSet<Author> Authors { get; set; }

    public virtual DbSet<Book> Books { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Discount> Discounts { get; set; }

    public virtual DbSet<Genre> Genres { get; set; }

    public virtual DbSet<MemberDiscount> MemberDiscounts { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<Publisher> Publishers { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Session> Sessions { get; set; }

    public virtual DbSet<Wishlist> Wishlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Host=localhost;Database=PustakBhandar;Username=postgres;Password=1415");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasIndex(e => e.AdminId, "IX_Announcements_AdminId");

            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Admin).WithMany(p => p.Announcements).HasForeignKey(d => d.AdminId);
        });

        modelBuilder.Entity<AspNetRole>(entity =>
        {
            entity.HasIndex(e => e.NormalizedName, "RoleNameIndex").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(256);
            entity.Property(e => e.NormalizedName).HasMaxLength(256);
        });

        modelBuilder.Entity<AspNetRoleClaim>(entity =>
        {
            entity.HasIndex(e => e.RoleId, "IX_AspNetRoleClaims_RoleId");

            entity.HasOne(d => d.Role).WithMany(p => p.AspNetRoleClaims).HasForeignKey(d => d.RoleId);
        });

        modelBuilder.Entity<AspNetUser>(entity =>
        {
            entity.HasIndex(e => e.NormalizedEmail, "EmailIndex");

            entity.HasIndex(e => e.NormalizedUserName, "UserNameIndex").IsUnique();

            entity.Property(e => e.DiscountEarned).HasPrecision(10, 2);
            entity.Property(e => e.Discriminator).HasMaxLength(21);
            entity.Property(e => e.Email).HasMaxLength(256);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.NormalizedEmail).HasMaxLength(256);
            entity.Property(e => e.NormalizedUserName).HasMaxLength(256);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.RefreshToken).HasDefaultValueSql("''::text");
            entity.Property(e => e.RefreshTokenExpiryTime).HasDefaultValueSql("'-infinity'::timestamp with time zone");
            entity.Property(e => e.UserName).HasMaxLength(256);

            entity.HasMany(d => d.Roles).WithMany(p => p.Users)
                .UsingEntity<Dictionary<string, object>>(
                    "AspNetUserRole",
                    r => r.HasOne<AspNetRole>().WithMany().HasForeignKey("RoleId"),
                    l => l.HasOne<AspNetUser>().WithMany().HasForeignKey("UserId"),
                    j =>
                    {
                        j.HasKey("UserId", "RoleId");
                        j.ToTable("AspNetUserRoles");
                        j.HasIndex(new[] { "RoleId" }, "IX_AspNetUserRoles_RoleId");
                    });
        });

        modelBuilder.Entity<AspNetUserClaim>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_AspNetUserClaims_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserClaims).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserLogin>(entity =>
        {
            entity.HasKey(e => new { e.LoginProvider, e.ProviderKey });

            entity.HasIndex(e => e.UserId, "IX_AspNetUserLogins_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserLogins).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<AspNetUserToken>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.LoginProvider, e.Name });

            entity.HasOne(d => d.User).WithMany(p => p.AspNetUserTokens).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Author>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasIndex(e => e.AuthorId, "IX_Books_AuthorId");

            entity.HasIndex(e => e.DiscountId, "IX_Books_DiscountId");

            entity.HasIndex(e => e.GenreId, "IX_Books_GenreId");

            entity.HasIndex(e => e.PublisherId, "IX_Books_PublisherId");

            entity.Property(e => e.Format).HasMaxLength(50);
            entity.Property(e => e.Isbn)
                .HasMaxLength(20)
                .HasColumnName("ISBN");
            entity.Property(e => e.Price).HasPrecision(10, 2);
            entity.Property(e => e.Rating).HasPrecision(2, 1);
            entity.Property(e => e.Title).HasMaxLength(200);

            entity.HasOne(d => d.Author).WithMany(p => p.Books)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Discount).WithMany(p => p.Books)
                .HasForeignKey(d => d.DiscountId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(d => d.Genre).WithMany(p => p.Books)
                .HasForeignKey(d => d.GenreId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Publisher).WithMany(p => p.Books)
                .HasForeignKey(d => d.PublisherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.ToTable("Cart");

            entity.HasIndex(e => e.UserId, "IX_Cart_UserId").IsUnique();

            entity.Property(e => e.TotalAmount).HasPrecision(10, 2);

            entity.HasOne(d => d.User).WithOne(p => p.Cart).HasForeignKey<Cart>(d => d.UserId);
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasIndex(e => e.BookId, "IX_CartItems_BookId");

            entity.HasIndex(e => e.CartId, "IX_CartItems_CartId");

            entity.HasIndex(e => e.MemberId, "IX_CartItems_MemberId");

            entity.Property(e => e.CartId).HasDefaultValueSql("''::text");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("'-infinity'::timestamp with time zone");
            entity.Property(e => e.Price).HasPrecision(10, 2);

            entity.HasOne(d => d.Book).WithMany(p => p.CartItems).HasForeignKey(d => d.BookId);

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems).HasForeignKey(d => d.CartId);

            entity.HasOne(d => d.Member).WithMany(p => p.CartItems).HasForeignKey(d => d.MemberId);
        });

        modelBuilder.Entity<Discount>(entity =>
        {
            entity.HasIndex(e => e.AdminId, "IX_Discounts_AdminId");

            entity.Property(e => e.Percentage).HasPrecision(5, 2);

            entity.HasOne(d => d.Admin).WithMany(p => p.Discounts).HasForeignKey(d => d.AdminId);
        });

        modelBuilder.Entity<Genre>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<MemberDiscount>(entity =>
        {
            entity.HasIndex(e => e.DiscountId, "IX_MemberDiscounts_DiscountId");

            entity.HasIndex(e => e.MemberId, "IX_MemberDiscounts_MemberId");

            entity.HasOne(d => d.Discount).WithMany(p => p.MemberDiscounts).HasForeignKey(d => d.DiscountId);

            entity.HasOne(d => d.Member).WithMany(p => p.MemberDiscounts).HasForeignKey(d => d.MemberId);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.ToTable("Notification");

            entity.HasIndex(e => e.AdminId, "IX_Notification_AdminId");

            entity.HasIndex(e => e.MemberId, "IX_Notification_MemberId");

            entity.HasIndex(e => e.OrderId, "IX_Notification_OrderId");

            entity.HasIndex(e => e.StaffId, "IX_Notification_StaffId");

            entity.Property(e => e.Message).HasMaxLength(500);

            entity.HasOne(d => d.Admin).WithMany(p => p.NotificationAdmins).HasForeignKey(d => d.AdminId);

            entity.HasOne(d => d.Member).WithMany(p => p.NotificationMembers).HasForeignKey(d => d.MemberId);

            entity.HasOne(d => d.Order).WithMany(p => p.Notifications).HasForeignKey(d => d.OrderId);

            entity.HasOne(d => d.Staff).WithMany(p => p.NotificationStaffs).HasForeignKey(d => d.StaffId);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(e => e.AdminId, "IX_Orders_AdminId");

            entity.HasIndex(e => e.MemberId, "IX_Orders_MemberId");

            entity.HasIndex(e => e.ProcessedByStaffId, "IX_Orders_ProcessedByStaffId");

            entity.Property(e => e.ClaimCode).HasMaxLength(50);
            entity.Property(e => e.DiscountApplied).HasPrecision(10, 2);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.TotalAmount).HasPrecision(10, 2);

            entity.HasOne(d => d.Admin).WithMany(p => p.OrderAdmins).HasForeignKey(d => d.AdminId);

            entity.HasOne(d => d.Member).WithMany(p => p.OrderMembers).HasForeignKey(d => d.MemberId);

            entity.HasOne(d => d.ProcessedByStaff).WithMany(p => p.OrderProcessedByStaffs).HasForeignKey(d => d.ProcessedByStaffId);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasIndex(e => e.BookId, "IX_OrderItems_BookId");

            entity.HasIndex(e => e.OrderId, "IX_OrderItems_OrderId");

            entity.Property(e => e.Price).HasPrecision(10, 2);

            entity.HasOne(d => d.Book).WithMany(p => p.OrderItems).HasForeignKey(d => d.BookId);

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems).HasForeignKey(d => d.OrderId);
        });

        modelBuilder.Entity<Publisher>(entity =>
        {
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("Review");

            entity.HasIndex(e => e.AdminId, "IX_Review_AdminId");

            entity.HasIndex(e => e.BookId, "IX_Review_BookId");

            entity.HasIndex(e => e.MemberId, "IX_Review_MemberId");

            entity.HasIndex(e => e.StaffId, "IX_Review_StaffId");

            entity.HasOne(d => d.Admin).WithMany(p => p.ReviewAdmins).HasForeignKey(d => d.AdminId);

            entity.HasOne(d => d.Book).WithMany(p => p.Reviews).HasForeignKey(d => d.BookId);

            entity.HasOne(d => d.Member).WithMany(p => p.ReviewMembers).HasForeignKey(d => d.MemberId);

            entity.HasOne(d => d.Staff).WithMany(p => p.ReviewStaffs).HasForeignKey(d => d.StaffId);
        });

        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasIndex(e => e.UserId, "IX_Sessions_UserId");

            entity.HasOne(d => d.User).WithMany(p => p.Sessions).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Wishlist>(entity =>
        {
            entity.ToTable("Wishlist");

            entity.HasIndex(e => e.BookId, "IX_Wishlist_BookId");

            entity.HasIndex(e => e.MemberId, "IX_Wishlist_MemberId");

            entity.HasIndex(e => e.UserId, "IX_Wishlist_UserId").IsUnique();

            entity.Property(e => e.UserId).HasDefaultValueSql("''::text");

            entity.HasOne(d => d.Book).WithMany(p => p.Wishlists).HasForeignKey(d => d.BookId);

            entity.HasOne(d => d.Member).WithMany(p => p.WishlistMembers).HasForeignKey(d => d.MemberId);

            entity.HasOne(d => d.User).WithOne(p => p.WishlistUser).HasForeignKey<Wishlist>(d => d.UserId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
