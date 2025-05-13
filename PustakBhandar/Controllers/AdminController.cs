using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;
using System.Security.Claims;

namespace PustakBhandar.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            ApplicationDbContext context,
            ILogger<AdminController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("books")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks()
        {
            try
            {
                var books = await _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .Include(b => b.Publisher)
                    .Include(b => b.Discount)
                    .Select(b => new BookResponseDto
                    {
                        Id = b.Id,
                        Title = b.Title,
                        ISBN = b.ISBN,
                        AuthorName = b.Author!.Name,
                        GenreName = b.Genre!.Name,
                        PublisherName = b.Publisher!.Name,
                        Format = b.Format,
                        Price = b.Price,
                        PublicationDate = b.PublicationDate,
                        Quantity = b.Quantity,
                        Rating = b.Rating,
                        OnSale = b.OnSale,
                        DiscountId = b.DiscountId,
                        DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                        CreatedAt = b.CreatedAt,
                        CoverImageUrl = b.CoverImageUrl
                    })
                    .ToListAsync();

                return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books");
                return StatusCode(500, new { status = "error", message = "An error occurred while getting books", error = ex.Message });
            }
        }

        [HttpPost("books")]
        public async Task<ActionResult<BookResponseDto>> CreateBook(
            [FromForm] CreateBookDto createBookDto,
            [FromForm] IFormFile? coverImage)
        {
            try
            {
                // Unique ISBN check
                var existingIsbn = await _context.Books.FirstOrDefaultAsync(b => b.ISBN.ToLower() == createBookDto.ISBN.ToLower());
                if (existingIsbn != null)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "A book with this ISBN already exists",
                        error = "Duplicate ISBN",
                        existingBookId = existingIsbn.Id
                    });
                }
                // Price validation
                if (createBookDto.Price <= 0)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Price must be a positive number",
                        error = "Invalid Price"
                    });
                }
                // Quantity validation
                if (createBookDto.Quantity < 0)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Quantity must be a non-negative integer",
                        error = "Invalid Quantity"
                    });
                }
                // Publication date validation
                if (createBookDto.PublicationDate == default)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Publication date is required and must be valid",
                        error = "Invalid Publication Date"
                    });
                }

                // Check for duplicate title
                var existingBook = await _context.Books
                    .FirstOrDefaultAsync(b => b.Title.ToLower() == createBookDto.Title.ToLower());
                if (existingBook != null)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "A book with this title already exists",
                        error = "Duplicate Title",
                        existingBookId = existingBook.Id
                    });
                }

                // Get or create Author (case-insensitive)
                var author = await _context.Authors
                    .FirstOrDefaultAsync(a => a.Name.ToLower() == createBookDto.AuthorName.ToLower());
                if (author == null)
                {
                    author = new Author { Name = createBookDto.AuthorName };
                    _context.Authors.Add(author);
                    await _context.SaveChangesAsync();
                }

                // Get or create Genre (case-insensitive)
                var genre = await _context.Genres
                    .FirstOrDefaultAsync(g => g.Name.ToLower() == createBookDto.GenreName.ToLower());
                if (genre == null)
                {
                    genre = new Genre { Name = createBookDto.GenreName };
                    _context.Genres.Add(genre);
                    await _context.SaveChangesAsync();
                }

                // Get or create Publisher (case-insensitive)
                var publisher = await _context.Publishers
                    .FirstOrDefaultAsync(p => p.Name.ToLower() == createBookDto.PublisherName.ToLower());
                if (publisher == null)
                {
                    publisher = new Publisher { Name = createBookDto.PublisherName };
                    _context.Publishers.Add(publisher);
                    await _context.SaveChangesAsync();
                }

                if (createBookDto.DiscountId != null)
                {
                    var discount = await _context.Discounts.FindAsync(createBookDto.DiscountId);
                    if (discount == null)
                        return BadRequest(new {
                            status = 400,
                            message = "Discount not found",
                            error = "Bad Request",
                            discountId = createBookDto.DiscountId
                        });
                }

                // Handle image upload
                string coverImageUrl = null;
                if (coverImage != null && coverImage.Length > 0)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "covers");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(coverImage.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await coverImage.CopyToAsync(stream);
                    }
                    coverImageUrl = "/uploads/covers/" + fileName;
                }

                var book = new Book
                {
                    Title = createBookDto.Title,
                    ISBN = createBookDto.ISBN,
                    AuthorId = author.Id,
                    GenreId = genre.Id,
                    PublisherId = publisher.Id,
                    Format = createBookDto.Format,
                    Price = createBookDto.Price,
                    PublicationDate = DateTime.SpecifyKind(createBookDto.PublicationDate, DateTimeKind.Utc),
                    Quantity = createBookDto.Quantity,
                    OnSale = createBookDto.OnSale,
                    DiscountId = createBookDto.DiscountId,
                    CoverImageUrl = coverImageUrl
                };

                _context.Books.Add(book);
                await _context.SaveChangesAsync();

                // Get the created book with related data
                var createdBook = await _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .Include(b => b.Publisher)
                    .Include(b => b.Discount)
                    .FirstOrDefaultAsync(b => b.Id == book.Id);

                if (createdBook == null)
                    return NotFound(new {
                        status = 404,
                        message = "Book not found after creation",
                        error = "Not Found"
                    });

                return Ok(new {
                    status = 201,
                    message = "Book created successfully",
                    data = new BookResponseDto
                    {
                        Id = createdBook.Id,
                        Title = createdBook.Title,
                        ISBN = createdBook.ISBN,
                        AuthorName = createdBook.Author!.Name,
                        GenreName = createdBook.Genre!.Name,
                        PublisherName = createdBook.Publisher!.Name,
                        Format = createdBook.Format,
                        Price = createdBook.Price,
                        PublicationDate = createdBook.PublicationDate,
                        Quantity = createdBook.Quantity,
                        Rating = createdBook.Rating,
                        OnSale = createdBook.OnSale,
                        DiscountId = createdBook.DiscountId,
                        DiscountPercentage = createdBook.Discount?.Percentage,
                        CreatedAt = createdBook.CreatedAt,
                        CoverImageUrl = createdBook.CoverImageUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating book");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while creating the book",
                    error = ex.Message
                });
            }
        }

        [HttpPut("books/{id}")]
        public async Task<ActionResult<BookResponseDto>> UpdateBook(string id, [FromForm] UpdateBookDto updateBookDto, [FromForm] IFormFile? coverImage)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                    return NotFound(new {
                        status = 404,
                        message = "Book not found",
                        error = "Not Found",
                        bookId = id
                    });
                // Unique ISBN check (exclude current book)
                if (!string.IsNullOrWhiteSpace(updateBookDto.ISBN))
                {
                    var isbnExists = await _context.Books.AnyAsync(b => b.ISBN.ToLower() == updateBookDto.ISBN.ToLower() && b.Id != id);
                    if (isbnExists)
                    {
                        return BadRequest(new {
                            status = 400,
                            message = "A book with this ISBN already exists",
                            error = "Duplicate ISBN"
                        });
                    }
                }
                // Price validation
                if (updateBookDto.Price.HasValue && updateBookDto.Price.Value <= 0)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Price must be a positive number",
                        error = "Invalid Price"
                    });
                }
                // Quantity validation
                if (updateBookDto.Quantity.HasValue && updateBookDto.Quantity.Value < 0)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Quantity must be a non-negative integer",
                        error = "Invalid Quantity"
                    });
                }
                // Publication date validation
                if (updateBookDto.PublicationDate.HasValue && updateBookDto.PublicationDate.Value == default)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Publication date is required and must be valid",
                        error = "Invalid Publication Date"
                    });
                }

                // Normalize DiscountId: treat empty string as null
                if (updateBookDto.DiscountId != null && updateBookDto.DiscountId.Trim() == "")
                {
                    updateBookDto.DiscountId = null;
                }
                if (updateBookDto.DiscountId != null)
                {
                    var discount = await _context.Discounts.FindAsync(updateBookDto.DiscountId);
                    if (discount == null)
                        return BadRequest(new {
                            status = 400,
                            message = "Discount not found",
                            error = "Bad Request",
                            discountId = updateBookDto.DiscountId
                        });
                    book.DiscountId = updateBookDto.DiscountId;
                }
                else if (updateBookDto.DiscountId == null)
                {
                    // Remove discount
                    book.DiscountId = null;
                }

                // Update properties if provided
                if (updateBookDto.Title != null)
                    book.Title = updateBookDto.Title;
                if (updateBookDto.ISBN != null)
                    book.ISBN = updateBookDto.ISBN;
                if (updateBookDto.AuthorName != null)
                {
                    var author = await _context.Authors.FirstOrDefaultAsync(a => a.Name == updateBookDto.AuthorName);
                    if (author == null)
                    {
                        author = new Author { Name = updateBookDto.AuthorName };
                        _context.Authors.Add(author);
                        await _context.SaveChangesAsync();
                    }
                    book.AuthorId = author.Id;
                }
                if (updateBookDto.GenreName != null)
                {
                    var genre = await _context.Genres.FirstOrDefaultAsync(g => g.Name == updateBookDto.GenreName);
                    if (genre == null)
                    {
                        genre = new Genre { Name = updateBookDto.GenreName };
                        _context.Genres.Add(genre);
                        await _context.SaveChangesAsync();
                    }
                    book.GenreId = genre.Id;
                }
                if (updateBookDto.PublisherName != null)
                {
                    var publisher = await _context.Publishers.FirstOrDefaultAsync(p => p.Name == updateBookDto.PublisherName);
                    if (publisher == null)
                    {
                        publisher = new Publisher { Name = updateBookDto.PublisherName };
                        _context.Publishers.Add(publisher);
                        await _context.SaveChangesAsync();
                    }
                    book.PublisherId = publisher.Id;
                }
                if (updateBookDto.Format != null)
                    book.Format = updateBookDto.Format;
                if (updateBookDto.Price.HasValue)
                    book.Price = updateBookDto.Price.Value;
                if (updateBookDto.PublicationDate.HasValue)
                    book.PublicationDate = updateBookDto.PublicationDate.Value;
                if (updateBookDto.Quantity.HasValue)
                    book.Quantity = updateBookDto.Quantity.Value;
                if (updateBookDto.OnSale.HasValue)
                    book.OnSale = updateBookDto.OnSale.Value;

                // Handle image upload if provided
                if (coverImage != null && coverImage.Length > 0)
                {
                    var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "covers");
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(coverImage.FileName);
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await coverImage.CopyToAsync(stream);
                    }
                    book.CoverImageUrl = "/uploads/covers/" + fileName;
                }

                await _context.SaveChangesAsync();

                // Get the updated book with related data
                var updatedBook = await _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .Include(b => b.Publisher)
                    .Include(b => b.Discount)
                    .FirstOrDefaultAsync(b => b.Id == id);

                if (updatedBook == null)
                    return NotFound(new {
                        status = 404,
                        message = "Book not found after update",
                        error = "Not Found",
                        bookId = id
                    });

                return Ok(new {
                    status = 200,
                    message = "Book updated successfully",
                    data = new BookResponseDto
                    {
                        Id = updatedBook.Id,
                        Title = updatedBook.Title,
                        ISBN = updatedBook.ISBN,
                        AuthorName = updatedBook.Author!.Name,
                        GenreName = updatedBook.Genre!.Name,
                        PublisherName = updatedBook.Publisher!.Name,
                        Format = updatedBook.Format,
                        Price = updatedBook.Price,
                        PublicationDate = updatedBook.PublicationDate,
                        Quantity = updatedBook.Quantity,
                        Rating = updatedBook.Rating,
                        OnSale = updatedBook.OnSale,
                        DiscountId = updatedBook.DiscountId,
                        DiscountPercentage = updatedBook.Discount?.Percentage,
                        CreatedAt = updatedBook.CreatedAt,
                        CoverImageUrl = updatedBook.CoverImageUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating book");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while updating the book",
                    error = ex.Message
                });
            }
        }

        [HttpDelete("books/{id}")]
        public async Task<IActionResult> DeleteBook(string id)
        {
            try
            {
                var book = await _context.Books.FindAsync(id);
                if (book == null)
                    return NotFound(new { 
                        status = 404,
                        message = "Book not found",
                        error = "Not Found",
                        bookId = id 
                    });

                _context.Books.Remove(book);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    status = 200,
                    message = "Book deleted successfully",
                    bookId = id 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting book");
                return StatusCode(500, new { 
                    status = 500,
                    message = "An error occurred while deleting the book",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("discounts")]
        public async Task<ActionResult<IEnumerable<DiscountResponseDto>>> GetDiscounts()
        {
            try
            {
                var discounts = await _context.Discounts
                    .Select(d => new DiscountResponseDto
                    {
                        Id = d.Id,
                        AdminId = d.AdminId,
                        Description = d.Description,
                        Percentage = d.Percentage,
                        StartDate = d.StartDate,
                        EndDate = d.EndDate,
                        IsActive = d.IsActive,
                        CreatedAt = d.CreatedAt,
                        UpdatedAt = d.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new { status = "success", message = "Discounts retrieved successfully", data = discounts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discounts");
                return StatusCode(500, new { status = "error", message = "An error occurred while getting discounts", error = ex.Message });
            }
        }

        [HttpPost("discounts")]
        public async Task<ActionResult<DiscountResponseDto>> CreateDiscount(CreateDiscountDto createDiscountDto)
        {
            try
            {
                // Validate dates
                if (createDiscountDto.StartDate >= createDiscountDto.EndDate)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Start date must be before end date",
                        error = "Invalid Date Range"
                    });
                }

                // Get the current admin's ID from the claims
                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId))
                {
                    return Unauthorized(new {
                        status = 401,
                        message = "Admin ID not found in token",
                        error = "Unauthorized"
                    });
                }

                var discount = new Discount
                {
                    AdminId = adminId,
                    Description = createDiscountDto.Description,
                    Percentage = createDiscountDto.Percentage,
                    StartDate = DateTime.SpecifyKind(createDiscountDto.StartDate, DateTimeKind.Utc),
                    EndDate = DateTime.SpecifyKind(createDiscountDto.EndDate, DateTimeKind.Utc),
                    IsActive = createDiscountDto.IsActive
                };

                _context.Discounts.Add(discount);
                await _context.SaveChangesAsync();

                return Ok(new { status = "success", message = "Discount created successfully", data = new DiscountResponseDto
                    {
                        Id = discount.Id,
                        AdminId = discount.AdminId,
                        Description = discount.Description,
                        Percentage = discount.Percentage,
                        StartDate = discount.StartDate,
                        EndDate = discount.EndDate,
                        IsActive = discount.IsActive,
                        CreatedAt = discount.CreatedAt,
                        UpdatedAt = discount.UpdatedAt
                } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating discount");
                return StatusCode(500, new { status = "error", message = "An error occurred while creating the discount", error = ex.Message });
            }
        }

        [HttpPut("discounts/{id}")]
        public async Task<ActionResult<DiscountResponseDto>> UpdateDiscount(string id, UpdateDiscountDto updateDiscountDto)
        {
            try
            {
                var discount = await _context.Discounts
                    .Include(d => d.Books) // Include related books
                    .FirstOrDefaultAsync(d => d.Id == id);
            
                if (discount == null)
                    return NotFound(new {
                        status = 404,
                        message = "Discount not found",
                        error = "Not Found",
                        discountId = id
                    });

                // Validate dates if both are provided
                if (updateDiscountDto.StartDate.HasValue && updateDiscountDto.EndDate.HasValue)
                {
                    if (updateDiscountDto.StartDate.Value >= updateDiscountDto.EndDate.Value)
                    {
                        return BadRequest(new {
                            status = 400,
                            message = "Start date must be before end date",
                            error = "Invalid Date Range"
                        });
                    }
                }
                // Validate dates if only one is provided
                else if (updateDiscountDto.StartDate.HasValue && updateDiscountDto.StartDate.Value >= discount.EndDate)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "Start date must be before existing end date",
                        error = "Invalid Date Range"
                    });
                }
                else if (updateDiscountDto.EndDate.HasValue && discount.StartDate >= updateDiscountDto.EndDate.Value)
                {
                    return BadRequest(new {
                        status = 400,
                        message = "End date must be after existing start date",
                        error = "Invalid Date Range"
                    });
                }

                // Update properties if provided
                if (updateDiscountDto.Description != null)
                    discount.Description = updateDiscountDto.Description;
                if (updateDiscountDto.Percentage.HasValue)
                    discount.Percentage = updateDiscountDto.Percentage.Value;
                if (updateDiscountDto.StartDate.HasValue)
                    discount.StartDate = DateTime.SpecifyKind(updateDiscountDto.StartDate.Value, DateTimeKind.Utc);
                if (updateDiscountDto.EndDate.HasValue)
                    discount.EndDate = DateTime.SpecifyKind(updateDiscountDto.EndDate.Value, DateTimeKind.Utc);
                if (updateDiscountDto.IsActive.HasValue)
                {
                    // If discount is being deactivated, clear all book associations
                    if (!updateDiscountDto.IsActive.Value && discount.IsActive)
                    {
                        foreach (var book in discount.Books)
                        {
                            book.DiscountId = null;
                            book.OnSale = false;
                        }
                    }
                    discount.IsActive = updateDiscountDto.IsActive.Value;
                }

                discount.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new { status = "success", message = "Discount updated successfully", data = new DiscountResponseDto
                    {
                        Id = discount.Id,
                        AdminId = discount.AdminId,
                        Description = discount.Description,
                        Percentage = discount.Percentage,
                        StartDate = discount.StartDate,
                        EndDate = discount.EndDate,
                        IsActive = discount.IsActive,
                        CreatedAt = discount.CreatedAt,
                        UpdatedAt = discount.UpdatedAt
                } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating discount");
                return StatusCode(500, new { status = "error", message = "An error occurred while updating the discount", error = ex.Message });
            }
        }

        [HttpDelete("discounts/{id}")]
        public async Task<IActionResult> DeleteDiscount(string id)
        {
            try
            {
                var discount = await _context.Discounts.FindAsync(id);
                if (discount == null)
                    return NotFound(new {
                        status = 404,
                        message = "Discount not found",
                        error = "Not Found",
                        discountId = id
                    });

                _context.Discounts.Remove(discount);
                await _context.SaveChangesAsync();

                return Ok(new { status = "success", message = "Discount deleted successfully", discountId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting discount");
                return StatusCode(500, new { status = "error", message = "An error occurred while deleting the discount", error = ex.Message });
            }
        }

        // Announcement Management
        [HttpGet("announcements")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AnnouncementResponseDto>>> GetAnnouncements()
        {
            try
            {
                var announcements = await _context.Announcements
                    .OrderByDescending(a => a.CreatedAt)
                    .ToListAsync();

                var response = announcements.Select(a => new AnnouncementResponseDto
                {
                    Id = a.Id,
                    AdminId = a.AdminId,
                    Title = a.Title,
                    Message = a.Message,
                    Type = a.Type,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                });

                return Ok(new { status = "success", message = "Announcements retrieved successfully", data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving announcements");
                return StatusCode(500, new { status = "error", message = "Internal server error" });
            }
        }

        [HttpPost("announcements")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AnnouncementResponseDto>> CreateAnnouncement(CreateAnnouncementDto createAnnouncementDto)
        {
            try
            {
                if (createAnnouncementDto.StartDate >= createAnnouncementDto.EndDate)
                {
                    return BadRequest(new { status = 400, message = "Start date must be before end date" });
                }

                var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                var announcement = new Announcement
                {
                    AdminId = adminId,
                    Title = createAnnouncementDto.Title,
                    Message = createAnnouncementDto.Message,
                    Type = createAnnouncementDto.Type,
                    StartDate = DateTime.SpecifyKind(createAnnouncementDto.StartDate, DateTimeKind.Utc),
                    EndDate = DateTime.SpecifyKind(createAnnouncementDto.EndDate, DateTimeKind.Utc),
                    IsActive = createAnnouncementDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Announcements.Add(announcement);
                await _context.SaveChangesAsync();

                var response = new AnnouncementResponseDto
                {
                    Id = announcement.Id,
                    AdminId = announcement.AdminId,
                    Title = announcement.Title,
                    Message = announcement.Message,
                    Type = announcement.Type,
                    StartDate = announcement.StartDate,
                    EndDate = announcement.EndDate,
                    IsActive = announcement.IsActive,
                    CreatedAt = announcement.CreatedAt
                };

                return CreatedAtAction(nameof(GetAnnouncements), new { id = announcement.Id }, new { status = "success", message = "Announcement created successfully", data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating announcement");
                return StatusCode(500, new { status = "error", message = "Internal server error" });
            }
        }

        [HttpPut("announcements/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<AnnouncementResponseDto>> UpdateAnnouncement(string id, UpdateAnnouncementDto updateAnnouncementDto)
        {
            try
            {
                var announcement = await _context.Announcements.FindAsync(id);
                if (announcement == null)
                {
                    return NotFound(new { status = 404, message = "Announcement not found" });
                }

                // Validate date range if both dates are provided
                if (updateAnnouncementDto.StartDate.HasValue && updateAnnouncementDto.EndDate.HasValue)
                {
                    if (updateAnnouncementDto.StartDate.Value >= updateAnnouncementDto.EndDate.Value)
                    {
                        return BadRequest(new { status = 400, message = "Start date must be before end date" });
                    }
                }
                // Validate date range if only one date is provided
                else if (updateAnnouncementDto.StartDate.HasValue && updateAnnouncementDto.StartDate.Value >= announcement.EndDate)
                {
                    return BadRequest(new { status = 400, message = "Start date must be before end date" });
                }
                else if (updateAnnouncementDto.EndDate.HasValue && announcement.StartDate >= updateAnnouncementDto.EndDate.Value)
                {
                    return BadRequest(new { status = 400, message = "Start date must be before end date" });
                }

                // Update only provided fields
                if (updateAnnouncementDto.Title != null)
                    announcement.Title = updateAnnouncementDto.Title;
                if (updateAnnouncementDto.Message != null)
                    announcement.Message = updateAnnouncementDto.Message;
                if (updateAnnouncementDto.Type != null)
                    announcement.Type = updateAnnouncementDto.Type;
                if (updateAnnouncementDto.StartDate.HasValue)
                    announcement.StartDate = DateTime.SpecifyKind(updateAnnouncementDto.StartDate.Value, DateTimeKind.Utc);
                if (updateAnnouncementDto.EndDate.HasValue)
                    announcement.EndDate = DateTime.SpecifyKind(updateAnnouncementDto.EndDate.Value, DateTimeKind.Utc);
                if (updateAnnouncementDto.IsActive.HasValue)
                    announcement.IsActive = updateAnnouncementDto.IsActive.Value;

                announcement.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new AnnouncementResponseDto
                {
                    Id = announcement.Id,
                    AdminId = announcement.AdminId,
                    Title = announcement.Title,
                    Message = announcement.Message,
                    Type = announcement.Type,
                    StartDate = announcement.StartDate,
                    EndDate = announcement.EndDate,
                    IsActive = announcement.IsActive,
                    CreatedAt = announcement.CreatedAt,
                    UpdatedAt = announcement.UpdatedAt
                };

                return Ok(new { status = "success", message = "Announcement updated successfully", data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating announcement");
                return StatusCode(500, new { status = "error", message = "Internal server error" });
            }
        }

        [HttpDelete("announcements/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAnnouncement(string id)
        {
            try
            {
                var announcement = await _context.Announcements.FindAsync(id);
                if (announcement == null)
                {
                    return NotFound(new { status = 404, message = "Announcement not found" });
                }

                _context.Announcements.Remove(announcement);
                await _context.SaveChangesAsync();

                return Ok(new { status = "success", message = "Announcement deleted successfully", data = new { id = announcement.Id } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting announcement");
                return StatusCode(500, new { status = "error", message = "Internal server error" });
            }
        }

        // Order Management
        [HttpGet("orders")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AdminOrderResponseDto>>> GetOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.Member)
                    .Include(o => o.ProcessedByStaff)
                    .Include(o => o.Items)
                        .ThenInclude(i => i.Book)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                var response = orders.Select(o => new AdminOrderResponseDto
                {
                    Id = o.Id,
                    MemberId = o.MemberId,
                    MemberName = o.Member.FullName,
                    MemberEmail = o.Member.Email,
                    ClaimCode = o.ClaimCode,
                    TotalAmount = o.Items.Sum(i => i.Price * i.Quantity),
                    DiscountApplied = o.DiscountApplied,
                    Status = o.Status,
                    OrderDate = o.OrderDate,
                    OrderTime = o.OrderDate.ToString("HH:mm:ss"),
                    DiscountName = o.Items.Select(i => i.Book?.Discount?.Description).FirstOrDefault(d => !string.IsNullOrEmpty(d)),
                    ProcessedByStaffId = o.ProcessedByStaffId,
                    ProcessedByStaffName = o.ProcessedByStaff?.FullName,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        BookId = i.BookId,
                        BookTitle = i.Book.Title,
                        Format = i.Book.Format,
                        Price = i.Price,
                        Quantity = i.Quantity,
                        Subtotal = i.Price * i.Quantity
                    }).ToList()
                });

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving orders");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        // Member Management
        [HttpGet("members")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AdminMemberResponseDto>>> GetMembers()
        {
            try
            {
                var members = await _context.Users
                    .Where(u => u.GetType() == typeof(Member))
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();

                var response = members.Select(m => new AdminMemberResponseDto
                {
                    Id = m.Id,
                    FullName = m.FullName,
                    Email = m.Email,
                    PhoneNumber = m.PhoneNumber,
                    JoinDate = ((Member)m).JoinDate,
                    TotalOrders = _context.Orders.Count(o => o.MemberId == m.Id),
                    DiscountEarned = _context.Orders.Where(o => o.MemberId == m.Id && o.Status == "Completed").Sum(o => (decimal?)o.DiscountApplied) ?? 0,
                    IsActive = m.EmailConfirmed,
                    CreatedAt = m.CreatedAt
                });

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving members");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        // Inventory Management
        [HttpGet("inventory")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<InventoryResponseDto>>> GetInventory()
        {
            try
            {
                var books = await _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .Include(b => b.Publisher)
                    .OrderBy(b => b.Title)
                    .ToListAsync();

                var response = books.Select(b => new InventoryResponseDto
                {
                    BookId = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    Quantity = b.Quantity,
                    OnSale = b.OnSale,
                    LastUpdated = b.UpdatedAt ?? b.CreatedAt
                });

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving inventory");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpPut("inventory/{bookId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<InventoryResponseDto>> UpdateInventory(string bookId, UpdateInventoryDto updateInventoryDto)
        {
            try
            {
                var book = await _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .Include(b => b.Publisher)
                    .FirstOrDefaultAsync(b => b.Id == bookId);

                if (book == null)
                {
                    return NotFound(new { status = 404, message = "Book not found" });
                }

                // Update only provided fields
                book.Quantity = updateInventoryDto.Quantity;
                if (updateInventoryDto.OnSale.HasValue)
                    book.OnSale = updateInventoryDto.OnSale.Value;
                if (updateInventoryDto.Price.HasValue)
                    book.Price = updateInventoryDto.Price.Value;
                book.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new InventoryResponseDto
                {
                    BookId = book.Id,
                    Title = book.Title,
                    ISBN = book.ISBN,
                    AuthorName = book.Author.Name,
                    GenreName = book.Genre.Name,
                    PublisherName = book.Publisher.Name,
                    Format = book.Format,
                    Price = book.Price,
                    Quantity = book.Quantity,
                    OnSale = book.OnSale,
                    LastUpdated = book.UpdatedAt ?? book.CreatedAt
                };

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inventory");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpGet("staff")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AdminMemberResponseDto>>> GetStaff()
        {
            try
            {
                var staffUsers = await _context.Users
                    .Where(u => u.GetType() == typeof(Staff))
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();

                var response = staffUsers.Select(s => new AdminMemberResponseDto
                {
                    Id = s.Id,
                    FullName = s.FullName,
                    Email = s.Email,
                    PhoneNumber = s.PhoneNumber,
                    JoinDate = s.CreatedAt, // or a Staff-specific property if you have one
                    TotalOrders = _context.Orders.Count(o => o.ProcessedByStaffId == s.Id),
                    DiscountEarned = 0, // Not applicable for staff
                    IsActive = s.EmailConfirmed,
                    CreatedAt = s.CreatedAt
                });

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving staff");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }
    }
} 