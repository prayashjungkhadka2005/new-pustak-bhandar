using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;
using PustakBhandar.Services;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace PustakBhandar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly JwtService _jwtService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            JwtService jwtService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _logger = logger;
        }

        [HttpGet("setup-roles")]
        public async Task<IActionResult> SetupRoles()
        {
            try
            {
                var roles = new[]
                {
                    new { Name = "Admin", Permissions = new[] { "manage_books", "manage_discounts", "manage_announcements", "manage_users", "view_reports" } },
                    new { Name = "Staff", Permissions = new[] { "process_orders", "manage_claim_codes", "view_orders" } },
                    new { Name = "Member", Permissions = new[] { "place_orders", "manage_cart", "leave_reviews", "view_books" } }
                };

                foreach (var role in roles)
                {
                    if (!await _roleManager.RoleExistsAsync(role.Name))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role.Name));
                    }
                }

                return Ok("Roles setup completed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting up roles");
                return StatusCode(500, "An error occurred while setting up roles");
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = new ApplicationUser
                {
                    UserName = model.Email,
                    Email = model.Email,
                    FullName = model.FullName,
                    PhoneNumber = model.PhoneNumber
                };

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // Assign role
                if (!await _roleManager.RoleExistsAsync("Member"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("Member"));
                }
                await _userManager.AddToRoleAsync(user, "Member");

                var token = await _jwtService.GenerateJwtToken(user);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, "An error occurred during registration");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return Unauthorized("Invalid email or password");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                if (!result.Succeeded)
                {
                    return Unauthorized("Invalid email or password");
                }

                var token = await _jwtService.GenerateJwtToken(user);
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, "An error occurred during login");
            }
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await _signInManager.SignOutAsync();
                return Ok("Logged out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user logout");
                return StatusCode(500, "An error occurred during logout");
            }
        }

        [HttpGet("me")]
        public async Task<ActionResult<UserProfileResponse>> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var roles = await _userManager.GetRolesAsync(user);
                return new UserProfileResponse
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    FullName = user.FullName ?? string.Empty,
                    PhoneNumber = user.PhoneNumber,
                    Roles = roles.ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, "An error occurred while getting user information");
            }
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<ActionResult<UserProfileResponse>> UpdateProfile(UpdateProfileRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                if (!string.IsNullOrEmpty(request.FullName))
                {
                    user.FullName = request.FullName;
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    var existingUser = await _userManager.FindByEmailAsync(request.Email);
                    if (existingUser != null && existingUser.Id != userId)
                    {
                        return BadRequest("Email is already taken");
                    }
                    user.Email = request.Email;
                    user.UserName = request.Email;
                }

                if (!string.IsNullOrEmpty(request.PhoneNumber))
                {
                    user.PhoneNumber = request.PhoneNumber;
                }

                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                return await GetCurrentUser();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user profile");
                return StatusCode(500, "An error occurred while updating profile");
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    return NotFound("User not found");
                }

                var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                return Ok("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password");
                return StatusCode(500, "An error occurred while changing password");
            }
        }
    }
} 