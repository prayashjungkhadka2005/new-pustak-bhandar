using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;

namespace PustakBhandar.Controllers
{
    [ApiController]
    [Route("api/books")]
    public class BookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<BookController> _logger;

        public BookController(ApplicationDbContext context, ILogger<BookController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: /api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooks([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/search
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> SearchBooks([FromQuery] string query)
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .Where(b => b.Title.Contains(query) || b.ISBN.Contains(query))
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/{bookId}
        [HttpGet("{bookId}")]
        public async Task<ActionResult<BookResponseDto>> GetBookDetails(string bookId)
        {
            var book = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null)
                return NotFound(new { status = 404, message = "Book not found" });

            var response = new BookResponseDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN,
                AuthorName = book.Author.Name,
                GenreName = book.Genre.Name,
                PublisherName = book.Publisher.Name,
                Format = book.Format,
                Price = book.Price,
                PublicationDate = book.PublicationDate,
                Quantity = book.Quantity,
                Rating = book.Reviews.Any() 
                    ? (decimal)book.Reviews.Average(r => r.Rating)
                    : 0,
                OnSale = book.OnSale,
                DiscountId = book.DiscountId,
                DiscountPercentage = book.Discount != null ? book.Discount.Percentage : null,
                CreatedAt = book.CreatedAt,
                CoverImageUrl = book.CoverImageUrl
            };

            return Ok(new { status = "success", message = "Book retrieved successfully", data = response });
        }

        // GET: /api/books/genre
        [HttpGet("genre")]
        public async Task<ActionResult<IEnumerable<GenreResponseDto>>> GetAllGenres()
        {
            var genres = await _context.Genres
                .OrderBy(g => g.Name)
                .Select(g => new GenreResponseDto
                {
                    Id = g.Id,
                    Name = g.Name
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Genres retrieved successfully", data = genres });
        }

        // GET: /api/books/genre/{genreId}
        [HttpGet("genre/{genreId}")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooksByGenre(string genreId)
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .Where(b => b.GenreId == genreId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/author/{authorId}
        [HttpGet("author/{authorId}")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooksByAuthor(string authorId)
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .Where(b => b.AuthorId == authorId)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/publisher/{id}
        [HttpGet("publisher/{id}")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> GetBooksByPublisher(string id)
        {
            var books = await _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .Where(b => b.PublisherId == id)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/sort
        [HttpGet("sort")]
        public async Task<ActionResult<IEnumerable<BookResponseDto>>> SortBooks([FromQuery] string sortBy = "createdAt", [FromQuery] string order = "desc")
        {
            var query = _context.Books
                .Include(b => b.Author)
                .Include(b => b.Genre)
                .Include(b => b.Publisher)
                .Include(b => b.Discount)
                .AsQueryable();

            switch (sortBy.ToLower())
            {
                case "title":
                    query = order.ToLower() == "asc" ? query.OrderBy(b => b.Title) : query.OrderByDescending(b => b.Title);
                    break;
                case "price":
                    query = order.ToLower() == "asc" ? query.OrderBy(b => b.Price) : query.OrderByDescending(b => b.Price);
                    break;
                case "rating":
                    query = order.ToLower() == "asc" ? query.OrderBy(b => b.Rating) : query.OrderByDescending(b => b.Rating);
                    break;
                default:
                    query = order.ToLower() == "asc" ? query.OrderBy(b => b.CreatedAt) : query.OrderByDescending(b => b.CreatedAt);
                    break;
            }

            var books = await query
                .Select(b => new BookResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN,
                    AuthorName = b.Author.Name,
                    GenreName = b.Genre.Name,
                    PublisherName = b.Publisher.Name,
                    Format = b.Format,
                    Price = b.Price,
                    PublicationDate = b.PublicationDate,
                    Quantity = b.Quantity,
                    Rating = b.Reviews.Any() 
                        ? (decimal)b.Reviews.Average(r => r.Rating)
                        : 0,
                    OnSale = b.OnSale,
                    DiscountId = b.DiscountId,
                    DiscountPercentage = b.Discount != null ? b.Discount.Percentage : null,
                    CreatedAt = b.CreatedAt,
                    CoverImageUrl = b.CoverImageUrl
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Books retrieved successfully", data = books });
        }

        // GET: /api/books/reviews
        [HttpGet("reviews")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDto>>> GetRecentReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Book)
                .Include(r => r.Member)
                .OrderByDescending(r => r.ReviewDate)
                .Take(3)
                .Select(r => new ReviewResponseDto
                {
                    Id = r.Id,
                    BookId = r.BookId,
                    MemberId = r.MemberId,
                    Rating = r.Rating,
                    Comment = r.Comment ?? string.Empty,
                    ReviewDate = r.ReviewDate,
                    BookTitle = r.Book.Title,
                    MemberName = r.Member.FullName
                })
                .ToListAsync();

            return Ok(new { status = "success", message = "Reviews retrieved successfully", data = reviews });
        }

        [HttpGet("{id}/reviews")]
        public async Task<ActionResult<IEnumerable<ReviewResponseDto>>> GetBookReviews(string id)
        {
            var book = await _context.Books
                .Include(b => b.Reviews)
                    .ThenInclude(r => r.Member)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null)
            {
                return NotFound(new { status = "error", message = "Book not found" });
            }

            var reviews = book.Reviews.Select(r => new ReviewResponseDto
            {
                Id = r.Id,
                BookId = r.BookId,
                MemberId = r.MemberId,
                Rating = r.Rating,
                Comment = r.Comment ?? string.Empty,
                ReviewDate = r.ReviewDate,
                BookTitle = book.Title,
                MemberName = r.Member.FullName
            });

            return Ok(new { status = "success", message = "Reviews retrieved successfully", data = reviews });
        }
    }
} 