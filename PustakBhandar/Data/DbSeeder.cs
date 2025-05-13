using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Models;

namespace PustakBhandar.Data
{
    public class DbSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public DbSeeder(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task SeedAsync()
        {
            // Create roles if they don't exist
            await CreateRolesAsync();

            // Create users if they don't exist
            await CreateUsersAsync();

            // Create books if they don't exist
            await CreateBooksAsync();

            // Create discounts if they don't exist
            await CreateDiscountsAsync();

            // Create announcements if they don't exist
            await CreateAnnouncementsAsync();

            // Create orders if they don't exist
            await CreateOrdersAsync();
        }

        private async Task CreateRolesAsync()
        {
            string[] roles = { "Admin", "Staff", "Member" };

            foreach (var role in roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private async Task CreateUsersAsync()
        {
            // Create Admin
            var admin = new Admin
            {
                UserName = "admin@pustakbhandar.com",
                Email = "admin@pustakbhandar.com",
                FullName = "Admin User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            if (await _userManager.FindByEmailAsync(admin.Email) == null)
            {
                var result = await _userManager.CreateAsync(admin, "Admin@123");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(admin, "Admin");
                }
            }

            // Create Staff
            var staff = new Staff
            {
                UserName = "staff@pustakbhandar.com",
                Email = "staff@pustakbhandar.com",
                FullName = "Staff User",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            if (await _userManager.FindByEmailAsync(staff.Email) == null)
            {
                var result = await _userManager.CreateAsync(staff, "Staff@123");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(staff, "Staff");
                }
            }

            // Create Member
            var member = new Member
            {
                UserName = "member@pustakbhandar.com",
                Email = "member@pustakbhandar.com",
                FullName = "Test Member",
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                JoinDate = DateTime.UtcNow,
                TotalOrders = 0,
                DiscountEarned = 0
            };

            if (await _userManager.FindByEmailAsync(member.Email) == null)
            {
                var result = await _userManager.CreateAsync(member, "Member@123");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(member, "Member");
                }
            }
        }

        private async Task CreateBooksAsync()
        {
            if (!await _context.Books.AnyAsync())
            {
                // Create Authors
                var author1 = new Author { Id = Guid.NewGuid().ToString(), Name = "J.K. Rowling" };
                var author2 = new Author { Id = Guid.NewGuid().ToString(), Name = "George R.R. Martin" };
                await _context.Authors.AddRangeAsync(author1, author2);

                // Create Genres
                var genre1 = new Genre { Id = Guid.NewGuid().ToString(), Name = "Fantasy" };
                var genre2 = new Genre { Id = Guid.NewGuid().ToString(), Name = "Science Fiction" };
                await _context.Genres.AddRangeAsync(genre1, genre2);

                // Create Publishers
                var publisher1 = new Publisher { Id = Guid.NewGuid().ToString(), Name = "Bloomsbury" };
                var publisher2 = new Publisher { Id = Guid.NewGuid().ToString(), Name = "Bantam Books" };
                await _context.Publishers.AddRangeAsync(publisher1, publisher2);

                await _context.SaveChangesAsync();

                // Create Books
                var books = new List<Book>
                {
                    new Book
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "Harry Potter and the Philosopher's Stone",
                        ISBN = "9780747532743",
                        AuthorId = author1.Id,
                        GenreId = genre1.Id,
                        PublisherId = publisher1.Id,
                        Format = "Hardcover",
                        Price = 29.99m,
                        PublicationDate = DateTime.SpecifyKind(new DateTime(1997, 6, 26), DateTimeKind.Utc),
                        Quantity = 50,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Rating = 4.5m,
                        OnSale = false
                    },
                    new Book
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "A Game of Thrones",
                        ISBN = "9780553103540",
                        AuthorId = author2.Id,
                        GenreId = genre1.Id,
                        PublisherId = publisher2.Id,
                        Format = "Paperback",
                        Price = 24.99m,
                        PublicationDate = DateTime.SpecifyKind(new DateTime(1996, 8, 1), DateTimeKind.Utc),
                        Quantity = 30,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Rating = 4.7m,
                        OnSale = true
                    }
                };

                await _context.Books.AddRangeAsync(books);
                await _context.SaveChangesAsync();
            }
        }

        private async Task CreateDiscountsAsync()
        {
            if (!await _context.Discounts.AnyAsync())
            {
                var admin = await _userManager.FindByEmailAsync("admin@pustakbhandar.com");
                if (admin != null)
                {
                    var discounts = new List<Discount>
                    {
                        new Discount
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Description = "Summer Sale - 20% off on all books",
                            Percentage = 20.00m,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddMonths(1),
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new Discount
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Description = "New Member Discount - 10% off on first purchase",
                            Percentage = 10.00m,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddYears(1),
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    await _context.Discounts.AddRangeAsync(discounts);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task CreateAnnouncementsAsync()
        {
            if (!await _context.Announcements.AnyAsync())
            {
                var admin = await _userManager.FindByEmailAsync("admin@pustakbhandar.com");
                if (admin != null)
                {
                    var announcements = new List<Announcement>
                    {
                        new Announcement
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Title = "Welcome to PustakBhandar",
                            Message = "Welcome to our online bookstore! Enjoy shopping with us.",
                            Type = "General",
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddMonths(1),
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        },
                        new Announcement
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Title = "Summer Sale",
                            Message = "Get 20% off on all books during our summer sale!",
                            Type = "Promotion",
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddMonths(1),
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    await _context.Announcements.AddRangeAsync(announcements);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task CreateOrdersAsync()
        {
            if (!await _context.Orders.AnyAsync())
            {
                var member = await _userManager.FindByEmailAsync("member@pustakbhandar.com");
                var staff = await _userManager.FindByEmailAsync("staff@pustakbhandar.com");
                var book = await _context.Books.FirstOrDefaultAsync();
                if (member != null && staff != null && book != null)
                {
                    var order = new Order
                    {
                        Id = Guid.NewGuid().ToString(),
                        MemberId = member.Id,
                        ClaimCode = "ABC123",
                        TotalAmount = book.Price * 2,
                        DiscountApplied = 10,
                        Status = "Completed",
                        OrderDate = DateTime.UtcNow,
                        ProcessedByStaffId = staff.Id
                    };

                    // Create and add order items
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        BookId = book.Id,
                        Price = book.Price,
                        Quantity = 2
                    };

                    // Add the order first
                    _context.Orders.Add(order);
                    await _context.SaveChangesAsync();

                    // Then add the order item
                    _context.OrderItems.Add(orderItem);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
} 