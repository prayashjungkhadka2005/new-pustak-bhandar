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
                        CreatedAt = b.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new { 
                    status = 200,
                    message = "Books retrieved successfully",
                    data = books 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting books");
                return StatusCode(500, new { 
                    status = 500,
                    message = "An error occurred while getting books",
                    error = ex.Message 
                });
            }
        }

        [HttpPost("books")]
        public async Task<ActionResult<BookResponseDto>> CreateBook(CreateBookDto createBookDto)
        {
            try
            {
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
                    DiscountId = createBookDto.DiscountId
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
                        CreatedAt = createdBook.CreatedAt
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
        public async Task<ActionResult<BookResponseDto>> UpdateBook(string id, UpdateBookDto updateBookDto)
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
                        CreatedAt = updatedBook.CreatedAt
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

                return Ok(new {
                    status = 200,
                    message = "Discounts retrieved successfully",
                    data = discounts
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discounts");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while getting discounts",
                    error = ex.Message
                });
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

                return Ok(new {
                    status = 201,
                    message = "Discount created successfully",
                    data = new DiscountResponseDto
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
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating discount");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while creating the discount",
                    error = ex.Message
                });
            }
        }

        [HttpPut("discounts/{id}")]
        public async Task<ActionResult<DiscountResponseDto>> UpdateDiscount(string id, UpdateDiscountDto updateDiscountDto)
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
                    discount.IsActive = updateDiscountDto.IsActive.Value;

                discount.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new {
                    status = 200,
                    message = "Discount updated successfully",
                    data = new DiscountResponseDto
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
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating discount");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while updating the discount",
                    error = ex.Message
                });
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

                return Ok(new {
                    status = 200,
                    message = "Discount deleted successfully",
                    discountId = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting discount");
                return StatusCode(500, new {
                    status = 500,
                    message = "An error occurred while deleting the discount",
                    error = ex.Message
                });
            }
        }
    }
} 