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
    }
} 