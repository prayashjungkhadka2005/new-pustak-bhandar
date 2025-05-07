using Microsoft.AspNetCore.Mvc;
using PustakBhandar.Data;
using PustakBhandar.Models;
using MongoDB.Driver;

namespace PustakBhandar.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public BooksController(MongoDbContext context)
        {
            _context = context;
        }

        // GET: api/books
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            var books = await _context.Books.Find(_ => true).ToListAsync();
            return Ok(books);
        }

        // GET: api/books/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Book>> GetBook(string id)
        {
            var book = await _context.Books.Find(b => b.Id == id).FirstOrDefaultAsync();
            if (book == null) return NotFound();
            return Ok(book);
        }

        // POST: api/books
        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook(Book book)
        {
            await _context.Books.InsertOneAsync(book);
            return CreatedAtAction(nameof(GetBook), new { id = book.Id }, book);
        }

        // DELETE: api/books/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBook(string id)
        {
            var result = await _context.Books.DeleteOneAsync(b => b.Id == id);
            if (result.DeletedCount == 0) return NotFound();
            return NoContent();
        }
    }
}
