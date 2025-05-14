using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace PustakBhandar.Controllers
{
    [Authorize(Roles = "Staff")]
    [ApiController]
    [Route("api/staff")]
    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<StaffController> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;

        public StaffController(
            ApplicationDbContext context, 
            ILogger<StaffController> logger,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        // GET: /api/staff/orders
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<AdminOrderResponseDto>>> GetOrders()
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

        // PUT: /api/staff/orders/{orderId}/process
        [HttpPut("orders/{orderId}/process")]
        public async Task<IActionResult> ProcessOrder(string orderId, [FromBody] ProcessOrderRequestDto request)
        {
            var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(staffId))
                return Unauthorized(new { status = 401, message = "Unauthorized" });

            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null)
                return NotFound(new { status = 404, message = "Order not found" });

            if (order.ClaimCode != request.ClaimCode)
                return BadRequest(new { status = 400, message = "Invalid claim code" });

            if (order.Status != "Pending")
                return BadRequest(new { status = 400, message = "Order is not pending" });

            order.Status = "Confirmed";
            order.ProcessedByStaffId = staffId;
            await _context.SaveChangesAsync();

            // Check if member has reached 10 orders
            var member = await _context.Users
                .OfType<Member>()
                .FirstOrDefaultAsync(m => m.Id == order.MemberId);

            if (member != null)
            {
                var completedOrders = await _context.Orders
                    .CountAsync(o => o.MemberId == member.Id && o.Status == "Confirmed");

                if (completedOrders == 10)
                {
                    // Create discount alert notification
                    var notification = new Notification
                    {
                        MemberId = member.Id,
                        OrderId = null,
                        Message = "Congratulations! You have earned a 10% stackable discount for completing 10 orders.",
                        Type = "Discount Alert",
                        Timestamp = DateTime.UtcNow,
                        IsRead = false
                    };

                    _context.Notifications.Add(notification);

                    // Send real-time notification for discount alert
                    await _hubContext.Clients.User(member.Id).SendAsync("ReceiveNotification", new
                    {
                        message = "Congratulations! You have earned a 10% stackable discount for completing 10 orders.",
                        type = "Discount Alert",
                        timestamp = DateTime.UtcNow
                    });

                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { status = 200, message = "Order processed successfully" });
        }

        // PUT: /api/staff/orders/{orderId}/status
        [HttpPut("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(string orderId, [FromBody] UpdateOrderStatusRequestDto request)
        {
            var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(staffId))
                return Unauthorized(new { status = 401, message = "Unauthorized" });

            var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null)
                return NotFound(new { status = 404, message = "Order not found" });

            order.Status = request.Status;
            if (string.IsNullOrEmpty(order.ProcessedByStaffId))
                order.ProcessedByStaffId = staffId;
            await _context.SaveChangesAsync();

            return Ok(new { status = 200, message = "Order status updated successfully" });
        }
    }

    public class ProcessOrderRequestDto
    {
        public string ClaimCode { get; set; } = string.Empty;
    }

    public class UpdateOrderStatusRequestDto
    {
        public string Status { get; set; } = string.Empty;
    }
} 