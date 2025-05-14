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
        private readonly IWebHostEnvironment _environment;

        public DbSeeder(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IWebHostEnvironment environment)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _environment = environment;
        }

        public async Task SeedAsync()
        {
            // Create roles if they don't exist
            await CreateRolesAsync();

            // Create users if they don't exist
            await CreateUsersAsync();

            // Create authors, genres, and publishers
            await CreateBaseDataAsync();

            // Create books if they don't exist
            await CreateBooksAsync();

            // Create discounts if they don't exist
            await CreateDiscountsAsync();

            // Create announcements if they don't exist
            await CreateAnnouncementsAsync();

            // Create sample orders and reviews
            await CreateOrdersAndReviewsAsync();
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
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = "+1234567890"
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
                CreatedAt = DateTime.UtcNow,
                PhoneNumber = "+1234567891"
            };

            if (await _userManager.FindByEmailAsync(staff.Email) == null)
            {
                var result = await _userManager.CreateAsync(staff, "Staff@123");
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(staff, "Staff");
                }
            }

            // Create Members
            var members = new List<Member>
            {
                new Member
                {
                    UserName = "member1@pustakbhandar.com",
                    Email = "member1@pustakbhandar.com",
                    FullName = "John Doe",
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    JoinDate = DateTime.UtcNow,
                    TotalOrders = 0,
                    DiscountEarned = 0,
                    PhoneNumber = "+1234567892"
                },
                new Member
                {
                    UserName = "member2@pustakbhandar.com",
                    Email = "member2@pustakbhandar.com",
                    FullName = "Jane Smith",
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    JoinDate = DateTime.UtcNow,
                    TotalOrders = 0,
                    DiscountEarned = 0,
                    PhoneNumber = "+1234567893"
                }
            };

            foreach (var member in members)
            {
                if (await _userManager.FindByEmailAsync(member.Email) == null)
                {
                    var result = await _userManager.CreateAsync(member, "Member@123");
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(member, "Member");
                    }
                }
            }
        }

        private async Task CreateBaseDataAsync()
        {
            if (!await _context.Authors.AnyAsync())
            {
                var authors = new List<Author>
                {
                    new Author { Id = Guid.NewGuid().ToString(), Name = "J.K. Rowling" },
                    new Author { Id = Guid.NewGuid().ToString(), Name = "George R.R. Martin" },
                    new Author { Id = Guid.NewGuid().ToString(), Name = "Stephen King" },
                    new Author { Id = Guid.NewGuid().ToString(), Name = "Agatha Christie" }
                };
                await _context.Authors.AddRangeAsync(authors);
            }

            if (!await _context.Genres.AnyAsync())
            {
                var genres = new List<Genre>
                {
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Fantasy" },
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Science Fiction" },
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Horror" },
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Mystery" },
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Romance" },
                    new Genre { Id = Guid.NewGuid().ToString(), Name = "Thriller" }
                };
                await _context.Genres.AddRangeAsync(genres);
            }

            if (!await _context.Publishers.AnyAsync())
            {
                var publishers = new List<Publisher>
                {
                    new Publisher { Id = Guid.NewGuid().ToString(), Name = "Bloomsbury" },
                    new Publisher { Id = Guid.NewGuid().ToString(), Name = "Bantam Books" },
                    new Publisher { Id = Guid.NewGuid().ToString(), Name = "Penguin Books" },
                    new Publisher { Id = Guid.NewGuid().ToString(), Name = "HarperCollins" }
                };
                await _context.Publishers.AddRangeAsync(publishers);
            }

            await _context.SaveChangesAsync();
        }

        private async Task CreateBooksAsync()
        {
            if (!await _context.Books.AnyAsync())
            {
                var authors = await _context.Authors.ToListAsync();
                var genres = await _context.Genres.ToListAsync();
                var publishers = await _context.Publishers.ToListAsync();

                var books = new List<Book>
                {
                    new Book
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "Harry Potter and the Philosopher's Stone",
                        ISBN = "9780747532743",
                        AuthorId = authors.First(a => a.Name == "J.K. Rowling").Id,
                        GenreId = genres.First(g => g.Name == "Fantasy").Id,
                        PublisherId = publishers.First(p => p.Name == "Bloomsbury").Id,
                        Format = "Hardcover",
                        Price = 29.99m,
                        PublicationDate = DateTime.SpecifyKind(new DateTime(1997, 6, 26), DateTimeKind.Utc),
                        Quantity = 50,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Rating = 4.5m,
                        OnSale = false,
                        CoverImageUrl = "/images/books/harry-potter-1.jpg"
                    },
                    new Book
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "A Game of Thrones",
                        ISBN = "9780553103540",
                        AuthorId = authors.First(a => a.Name == "George R.R. Martin").Id,
                        GenreId = genres.First(g => g.Name == "Fantasy").Id,
                        PublisherId = publishers.First(p => p.Name == "Bantam Books").Id,
                        Format = "Paperback",
                        Price = 24.99m,
                        PublicationDate = DateTime.SpecifyKind(new DateTime(1996, 8, 1), DateTimeKind.Utc),
                        Quantity = 30,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Rating = 4.7m,
                        OnSale = true,
                        CoverImageUrl = "/images/books/game-of-thrones.jpg"
                    },
                    new Book
                    {
                        Id = Guid.NewGuid().ToString(),
                        Title = "The Shining",
                        ISBN = "9780385121675",
                        AuthorId = authors.First(a => a.Name == "Stephen King").Id,
                        GenreId = genres.First(g => g.Name == "Horror").Id,
                        PublisherId = publishers.First(p => p.Name == "Penguin Books").Id,
                        Format = "Paperback",
                        Price = 19.99m,
                        PublicationDate = DateTime.SpecifyKind(new DateTime(1977, 1, 28), DateTimeKind.Utc),
                        Quantity = 25,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        Rating = 4.3m,
                        OnSale = true,
                        CoverImageUrl = "/images/books/the-shining.jpg"
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
                        },
                        new Discount
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Description = "Holiday Special - 15% off on all fantasy books",
                            Percentage = 15.00m,
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddMonths(2),
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
                        },
                        new Announcement
                        {
                            Id = Guid.NewGuid().ToString(),
                            AdminId = admin.Id,
                            Title = "New Arrivals",
                            Message = "Check out our latest collection of books!",
                            Type = "News",
                            StartDate = DateTime.UtcNow,
                            EndDate = DateTime.UtcNow.AddMonths(2),
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow
                        }
                    };

                    await _context.Announcements.AddRangeAsync(announcements);
                    await _context.SaveChangesAsync();
                }
            }
        }

        private async Task CreateOrdersAndReviewsAsync()
        {
            if (!await _context.Orders.AnyAsync())
            {
                var member = await _userManager.FindByEmailAsync("member1@pustakbhandar.com") as Member;
                var books = await _context.Books.Take(2).ToListAsync();

                if (member != null && books.Any())
                {
                    var order = new Order
                    {
                        Id = Guid.NewGuid().ToString(),
                        MemberId = member.Id,
                        OrderDate = DateTime.UtcNow.AddDays(-5),
                        TotalAmount = books.Sum(b => b.Price),
                        Status = "Completed",
                        ClaimCode = Guid.NewGuid().ToString("N").Substring(0, 8),
                        Items = books.Select(b => new OrderItem
                        {
                            BookId = b.Id,
                            Quantity = 1,
                            Price = b.Price
                        }).ToList()
                    };

                    await _context.Orders.AddAsync(order);

                    // Add reviews
                    var reviews = books.Select(b => new Review
                    {
                        Id = Guid.NewGuid().ToString(),
                        BookId = b.Id,
                        MemberId = member.Id,
                        Rating = 5,
                        Comment = "Great book! Highly recommended."
                    });

                    await _context.Reviews.AddRangeAsync(reviews);
                    await _context.SaveChangesAsync();
                }
            }
        }
    }
} 