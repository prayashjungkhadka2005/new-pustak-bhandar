using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;
using System.Security.Claims;

namespace PustakBhandar.Controllers
{
    [Authorize(Roles = "Member")]
    [ApiController]
    [Route("api/members")]
    public class MemberController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<MemberController> _logger;

        public MemberController(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<MemberController> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        [HttpGet("profile")]
        public async Task<ActionResult<MemberProfileResponse>> GetProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                var member = await _context.Users
                    .OfType<Member>()
                    .FirstOrDefaultAsync(m => m.Id == userId);

                if (member == null)
                {
                    return NotFound(new { status = 404, message = "Member not found" });
                }

                var response = new MemberProfileResponse
                {
                    Id = member.Id,
                    Email = member.Email ?? string.Empty,
                    FullName = member.FullName,
                    PhoneNumber = member.PhoneNumber,
                    JoinDate = member.JoinDate,
                    TotalOrders = member.TotalOrders,
                    DiscountEarned = member.DiscountEarned,
                    IsActive = member.EmailConfirmed,
                    CreatedAt = member.CreatedAt
                };

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member profile");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<MemberProfileResponse>> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                var member = await _context.Users
                    .OfType<Member>()
                    .FirstOrDefaultAsync(m => m.Id == userId);

                if (member == null)
                {
                    return NotFound(new { status = 404, message = "Member not found" });
                }

                if (!string.IsNullOrEmpty(request.FullName))
                {
                    member.FullName = request.FullName;
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    var existingUser = await _userManager.FindByEmailAsync(request.Email);
                    if (existingUser != null && existingUser.Id != userId)
                    {
                        return BadRequest(new { status = 400, message = "Email is already taken" });
                    }
                    member.Email = request.Email;
                    member.UserName = request.Email;
                }

                if (!string.IsNullOrEmpty(request.PhoneNumber))
                {
                    member.PhoneNumber = request.PhoneNumber;
                }

                var result = await _userManager.UpdateAsync(member);
                if (!result.Succeeded)
                {
                    return BadRequest(new { status = 400, message = "Failed to update profile", errors = result.Errors });
                }

                var response = new MemberProfileResponse
                {
                    Id = member.Id,
                    Email = member.Email ?? string.Empty,
                    FullName = member.FullName,
                    PhoneNumber = member.PhoneNumber,
                    JoinDate = member.JoinDate,
                    TotalOrders = member.TotalOrders,
                    DiscountEarned = member.DiscountEarned,
                    IsActive = member.EmailConfirmed,
                    CreatedAt = member.CreatedAt
                };

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member profile");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpGet("whitelist")]
        public async Task<ActionResult<List<WishlistItemResponse>>> GetWishlist()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                var wishlistItems = await _context.Wishlists
                    .Include(w => w.Book)
                    .Where(w => w.UserId == userId)
                    .OrderByDescending(w => w.AddedAt)
                    .Select(w => new WishlistItemResponse
                    {
                        Id = w.Id,
                        BookId = w.BookId,
                        Title = w.Book.Title,
                        Author = w.Book.Author.Name,
                        Price = w.Book.Price,
                        CoverImageUrl = w.Book.CoverImageUrl,
                        AddedAt = w.AddedAt
                    })
                    .ToListAsync();

                return Ok(new { status = 200, data = wishlistItems });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving wishlist");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpPost("whitelist")]
        public async Task<ActionResult<WishlistItemResponse>> AddToWishlist(AddToWishlistRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                // Check if book exists
                var book = await _context.Books
                    .Include(b => b.Author)
                    .FirstOrDefaultAsync(b => b.Id == request.BookId);

                if (book == null)
                {
                    return NotFound(new { status = 404, message = "Book not found" });
                }

                // Check if book is already in wishlist
                var existingItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == request.BookId);

                if (existingItem != null)
                {
                    return BadRequest(new { status = 400, message = "Book is already in wishlist" });
                }

                // Add to wishlist
                var wishlistItem = new Wishlist
                {
                    UserId = userId,
                    BookId = request.BookId,
                    AddedAt = DateTime.UtcNow
                };

                _context.Wishlists.Add(wishlistItem);
                await _context.SaveChangesAsync();

                var response = new WishlistItemResponse
                {
                    Id = wishlistItem.Id,
                    BookId = book.Id,
                    Title = book.Title,
                    Author = book.Author.Name,
                    Price = book.Price,
                    CoverImageUrl = book.CoverImageUrl,
                    AddedAt = wishlistItem.AddedAt
                };

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding book to wishlist");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpDelete("whitelist/{bookId}")]
        public async Task<ActionResult> RemoveFromWishlist(string bookId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { status = 401, message = "Unauthorized" });
                }

                var wishlistItem = await _context.Wishlists
                    .FirstOrDefaultAsync(w => w.UserId == userId && w.BookId == bookId);

                if (wishlistItem == null)
                {
                    return NotFound(new { status = 404, message = "Book not found in wishlist" });
                }

                _context.Wishlists.Remove(wishlistItem);
                await _context.SaveChangesAsync();

                return Ok(new { status = 200, message = "Book removed from wishlist" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing book from wishlist");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpGet("cart")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<CartResponse>> GetCart()
        {
            try
            {
                var memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(memberId))
                    return Unauthorized(new { status = 401, message = "Unauthorized", error = "Unauthorized" });

                var member = await _context.Users
                    .OfType<Member>()
                    .Include(m => m.Cart)
                        .ThenInclude(c => c.Items)
                            .ThenInclude(i => i.Book)
                                .ThenInclude(b => b.Author)
                    .FirstOrDefaultAsync(m => m.Id == memberId);

                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found", error = "Not Found" });

                if (member.Cart == null)
                {
                    member.Cart = new Cart { UserId = memberId };
                    _context.Carts.Add(member.Cart);
                    await _context.SaveChangesAsync();
                }

                var cartResponse = new CartResponse
                {
                    Id = member.Cart.Id,
                    Items = member.Cart.Items.Select(item => new CartItemResponse
                    {
                        Id = item.Id,
                        BookId = item.BookId,
                        Title = item.Book.Title,
                        Author = item.Book.Author.Name,
                        CoverImageUrl = item.Book.CoverImageUrl,
                        Price = item.Price,
                        Quantity = item.Quantity,
                        Subtotal = item.Price * item.Quantity,
                        AddedAt = item.CreatedAt
                    }).ToList(),
                    TotalAmount = member.Cart.TotalAmount,
                    TotalItems = member.Cart.Items.Sum(i => i.Quantity),
                    UpdatedAt = member.Cart.UpdatedAt
                };

                return Ok(new { status = 200, message = "Cart retrieved successfully", data = cartResponse });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cart");
                return StatusCode(500, new { status = 500, message = "Internal server error", error = "Internal Server Error" });
            }
        }

        [HttpPost("cart")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<CartItemResponse>> AddToCart(AddToCartRequest request)
        {
            try
            {
                var memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(memberId))
                    return Unauthorized(new { status = 401, message = "Unauthorized", error = "Unauthorized" });

                var member = await _context.Users
                    .OfType<Member>()
                    .Include(m => m.Cart)
                        .ThenInclude(c => c.Items)
                    .FirstOrDefaultAsync(m => m.Id == memberId);

                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found", error = "Not Found" });

                var book = await _context.Books
                    .Include(b => b.Author)
                    .FirstOrDefaultAsync(b => b.Id == request.BookId);

                if (book == null)
                    return NotFound(new { status = 404, message = "Book not found", error = "Not Found" });

                if (book.Quantity < request.Quantity)
                    return BadRequest(new { status = 400, message = "Requested quantity not available", error = "Bad Request" });

                if (member.Cart == null)
                {
                    member.Cart = new Cart { UserId = memberId };
                    _context.Carts.Add(member.Cart);
                    await _context.SaveChangesAsync();
                }

                var existingItem = member.Cart.Items.FirstOrDefault(i => i.BookId == request.BookId);
                if (existingItem != null)
                {
                    existingItem.Quantity += request.Quantity;
                    existingItem.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        CartId = member.Cart.Id,
                        BookId = book.Id,
                        Quantity = request.Quantity,
                        Price = book.Price
                    };
                    member.Cart.Items.Add(cartItem);
                }

                member.Cart.TotalAmount = member.Cart.Items.Sum(i => i.Price * i.Quantity);
                member.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var addedItem = await _context.CartItems
                    .Include(i => i.Book)
                        .ThenInclude(b => b.Author)
                    .FirstOrDefaultAsync(i => i.BookId == request.BookId);

                if (addedItem == null)
                    return StatusCode(500, new { status = 500, message = "Failed to retrieve added item", error = "Internal Server Error" });

                var response = new CartItemResponse
                {
                    Id = addedItem.Id,
                    BookId = addedItem.BookId,
                    Title = addedItem.Book.Title,
                    Author = addedItem.Book.Author.Name,
                    CoverImageUrl = addedItem.Book.CoverImageUrl,
                    Price = addedItem.Price,
                    Quantity = addedItem.Quantity,
                    Subtotal = addedItem.Price * addedItem.Quantity,
                    AddedAt = addedItem.CreatedAt
                };

                return Ok(new { status = 200, message = "Item added to cart successfully", data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding item to cart");
                return StatusCode(500, new { status = 500, message = "Internal server error", error = "Internal Server Error" });
            }
        }

        [HttpPut("cart/{itemId}")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult<CartItemResponse>> UpdateCartItem(string itemId, UpdateCartItemRequest request)
        {
            try
            {
                var memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(memberId))
                    return Unauthorized(new { status = 401, message = "Unauthorized", error = "Unauthorized" });

                var member = await _context.Users
                    .OfType<Member>()
                    .Include(m => m.Cart)
                        .ThenInclude(c => c.Items)
                            .ThenInclude(i => i.Book)
                                .ThenInclude(b => b.Author)
                    .FirstOrDefaultAsync(m => m.Id == memberId);

                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found", error = "Not Found" });

                var cartItem = member.Cart?.Items.FirstOrDefault(i => i.Id == itemId);
                if (cartItem == null)
                    return NotFound(new { status = 404, message = "Cart item not found", error = "Not Found" });

                if (cartItem.Book.Quantity < request.Quantity)
                    return BadRequest(new { status = 400, message = "Requested quantity not available", error = "Bad Request" });

                cartItem.Quantity = request.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;

                member.Cart.TotalAmount = member.Cart.Items.Sum(i => i.Price * i.Quantity);
                member.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var response = new CartItemResponse
                {
                    Id = cartItem.Id,
                    BookId = cartItem.BookId,
                    Title = cartItem.Book.Title,
                    Author = cartItem.Book.Author.Name,
                    CoverImageUrl = cartItem.Book.CoverImageUrl,
                    Price = cartItem.Price,
                    Quantity = cartItem.Quantity,
                    Subtotal = cartItem.Price * cartItem.Quantity,
                    AddedAt = cartItem.CreatedAt
                };

                return Ok(new { status = 200, message = "Cart item updated successfully", data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating cart item");
                return StatusCode(500, new { status = 500, message = "Internal server error", error = "Internal Server Error" });
            }
        }

        [HttpDelete("cart/{itemId}")]
        [Authorize(Roles = "Member")]
        public async Task<ActionResult> RemoveCartItem(string itemId)
        {
            try
            {
                var memberId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(memberId))
                    return Unauthorized(new { status = 401, message = "Unauthorized", error = "Unauthorized" });

                var member = await _context.Users
                    .OfType<Member>()
                    .Include(m => m.Cart)
                        .ThenInclude(c => c.Items)
                    .FirstOrDefaultAsync(m => m.Id == memberId);

                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found", error = "Not Found" });

                var cartItem = member.Cart?.Items.FirstOrDefault(i => i.Id == itemId);
                if (cartItem == null)
                    return NotFound(new { status = 404, message = "Cart item not found", error = "Not Found" });

                member.Cart.Items.Remove(cartItem);
                member.Cart.TotalAmount = member.Cart.Items.Sum(i => i.Price * i.Quantity);
                member.Cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { status = 200, message = "Item removed from cart successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cart");
                return StatusCode(500, new { status = 500, message = "Internal server error", error = "Internal Server Error" });
            }
        }
    }
} 