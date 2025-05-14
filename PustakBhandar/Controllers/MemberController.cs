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
                    .Where(w => w.MemberId == userId)
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
                    .FirstOrDefaultAsync(w => w.MemberId == userId && w.BookId == request.BookId);

                if (existingItem != null)
                {
                    return BadRequest(new { status = 400, message = "Book is already in wishlist" });
                }

                // Add to wishlist
                var wishlistItem = new Wishlist
                {
                    MemberId = userId,
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
                    .FirstOrDefaultAsync(w => w.MemberId == userId && w.BookId == bookId);

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
                    member.Cart = new Cart { MemberId = memberId };
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
                    member.Cart = new Cart { MemberId = memberId };
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

        [HttpPost("orders")]
        public async Task<ActionResult<PlaceOrderResponseDto>> PlaceOrder()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { status = 401, message = "Unauthorized" });

                var member = await _userManager.FindByIdAsync(userId) as Member;
                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found" });

                var cart = await _context.Carts
                    .Include(c => c.Items)
                    .ThenInclude(ci => ci.Book)
                    .FirstOrDefaultAsync(c => c.MemberId == userId);

                if (cart == null || !cart.Items.Any())
                    return BadRequest(new { status = 400, message = "Cart is empty" });

                // Validate stock availability
                foreach (var item in cart.Items)
                {
                    if (item.Book.Quantity < item.Quantity)
                    {
                        return BadRequest(new { 
                            status = 400, 
                            message = $"Insufficient stock for book: {item.Book.Title}. Available: {item.Book.Quantity}, Requested: {item.Quantity}" 
                        });
                    }
                }

                var order = new Order
                {
                    MemberId = member.Id,
                    OrderDate = DateTime.UtcNow,
                    TotalAmount = cart.TotalAmount,
                    DiscountApplied = 0, // You can add discount logic here if needed
                    ClaimCode = Guid.NewGuid().ToString("N").Substring(0, 8),
                    Status = "Pending"
                };

                foreach (var item in cart.Items)
                {
                    // Decrease book quantity
                    item.Book.Quantity -= item.Quantity;
                    item.Book.UpdatedAt = DateTime.UtcNow;

                    order.Items.Add(new OrderItem
                    {
                        BookId = item.BookId,
                        Quantity = item.Quantity,
                        Price = item.Price
                    });
                }

                // Update member's total orders
                member.TotalOrders++;

                _context.Orders.Add(order);
                _context.Carts.Remove(cart);
                await _context.SaveChangesAsync();

                var response = new PlaceOrderResponseDto
                {
                    Id = order.Id,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    DiscountApplied = order.DiscountApplied,
                    Status = order.Status,
                    ClaimCode = order.ClaimCode,
                    Items = order.Items.Select(oi => new OrderItemResponseDto
                    {
                        BookId = oi.BookId,
                        BookTitle = oi.Book?.Title ?? "Unknown",
                        Format = oi.Book?.Format ?? "Unknown",
                        Price = oi.Price,
                        Quantity = oi.Quantity,
                        Subtotal = oi.Price * oi.Quantity
                    }).ToList()
                };

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error placing order");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpGet("orders")]
        public async Task<ActionResult<List<OrderHistoryItemDto>>> GetOrderHistory()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Book)
                .Where(o => o.MemberId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            var response = orders.Select(o => new OrderHistoryItemDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                DiscountApplied = o.DiscountApplied,
                Status = o.Status,
                ClaimCode = o.ClaimCode,
                Items = o.Items.Select(oi => new OrderItemResponseDto
                {
                    BookId = oi.BookId,
                    BookTitle = oi.Book?.Title ?? "Unknown",
                    Format = oi.Book?.Format ?? "Unknown",
                    Price = oi.Price,
                    Quantity = oi.Quantity,
                    Subtotal = oi.Price * oi.Quantity
                }).ToList()
            }).ToList();

            return Ok(response);
        }

        [HttpGet("orders/{orderId}/claim-code")]
        public async Task<ActionResult<ClaimCodeResponseDto>> GetClaimCode(string orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == orderId && o.MemberId == userId);

            if (order == null)
                return NotFound("Order not found.");

            var response = new ClaimCodeResponseDto
            {
                OrderId = order.Id,
                ClaimCode = order.ClaimCode
            };

            return Ok(response);
        }

        [HttpGet("discounts")]
        public async Task<ActionResult<List<DiscountResponseDto>>> GetEligibleDiscounts()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { status = 401, message = "Unauthorized" });

                var member = await _context.Users
                    .OfType<Member>()
                    .Include(m => m.Orders)
                    .FirstOrDefaultAsync(m => m.Id == userId);

                if (member == null)
                    return NotFound(new { status = 404, message = "Member not found" });

                var currentDate = DateTime.UtcNow;
                var eligibleDiscounts = await _context.Discounts
                    .Where(d => d.IsActive && 
                           d.StartDate <= currentDate && 
                           d.EndDate >= currentDate)
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

                // Add member-specific discounts based on order count
                if (member.TotalOrders >= 10)
                {
                    eligibleDiscounts.Add(new DiscountResponseDto
                    {
                        Id = "loyalty-discount",
                        Description = "Loyalty Discount - 10% off for 10+ orders",
                        Percentage = 10,
                        StartDate = currentDate,
                        EndDate = currentDate.AddYears(1),
                        IsActive = true,
                        CreatedAt = currentDate
                    });
                }

                return Ok(new { status = 200, data = eligibleDiscounts });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving eligible discounts");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpPost("reviews")]
        public async Task<ActionResult<ReviewResponseDto>> CreateReview(CreateReviewDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { status = 401, message = "Unauthorized" });

                // Verify if the member has purchased the book
                var hasPurchased = await _context.Orders
                    .Include(o => o.Items)
                    .AnyAsync(o => o.MemberId == userId && 
                                 o.Items.Any(i => i.BookId == request.BookId));

                if (!hasPurchased)
                    return BadRequest(new { status = 400, message = "You can only review books you have purchased" });

                // Check if member has already reviewed this book
                var existingReview = await _context.Reviews
                    .FirstOrDefaultAsync(r => r.MemberId == userId && r.BookId == request.BookId);

                if (existingReview != null)
                    return BadRequest(new { status = 400, message = "You have already reviewed this book" });

                var review = new Review
                {
                    BookId = request.BookId,
                    MemberId = userId,
                    Rating = request.Rating,
                    Comment = request.Comment,
                    ReviewDate = DateTime.UtcNow
                };

                _context.Reviews.Add(review);
                await _context.SaveChangesAsync();

                var response = new ReviewResponseDto
                {
                    Id = review.Id,
                    BookId = review.BookId,
                    MemberId = review.MemberId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    ReviewDate = review.ReviewDate
                };

                return Ok(new { status = 201, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating review");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetNotifications()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { status = 401, message = "Unauthorized" });

                var notifications = await _context.Notifications
                    .Where(n => n.MemberId == userId)
                    .OrderByDescending(n => n.Timestamp)
                    .Select(n => new NotificationResponseDto
                    {
                        Id = n.Id,
                        Message = n.Message,
                        OrderId = n.OrderId,
                        Timestamp = n.Timestamp,
                        IsRead = n.IsRead
                    })
                    .ToListAsync();

                return Ok(new { status = "success", message = "Notifications retrieved successfully", data = notifications });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving notifications");
                return StatusCode(500, new { status = "error", message = "Internal server error" });
            }
        }

        [HttpGet("reviews")]
        public async Task<ActionResult<List<object>>> GetMemberReviews()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { status = 401, message = "Unauthorized" });

                var reviews = await _context.Reviews
                    .Where(r => r.MemberId == userId)
                    .OrderByDescending(r => r.ReviewDate)
                    .ToListAsync();

                // Get book titles for all reviewed books
                var bookIds = reviews.Select(r => r.BookId).Distinct().ToList();
                var bookTitles = await _context.Books
                    .Where(b => bookIds.Contains(b.Id))
                    .ToDictionaryAsync(b => b.Id, b => b.Title);

                var response = reviews.Select(r => new
                {
                    Id = r.Id,
                    BookId = r.BookId,
                    BookTitle = bookTitles.ContainsKey(r.BookId) ? bookTitles[r.BookId] : "",
                    Rating = r.Rating,
                    Comment = r.Comment,
                    ReviewDate = r.ReviewDate
                }).ToList();

                return Ok(new { status = 200, data = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member reviews");
                return StatusCode(500, new { status = 500, message = "Internal server error" });
            }
        }
    }
} 