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
using Microsoft.AspNetCore.WebUtilities;
using System.Net;

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
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager,
            JwtService jwtService,
            ILogger<AuthController> logger,
            IConfiguration configuration,
            IEmailService emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _logger = logger;
            _configuration = configuration;
            _emailService = emailService;
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

                // Validate user type
                if (!new[] { "Admin", "Staff", "Member" }.Contains(model.UserType))
                {
                    return BadRequest("Invalid user type");
                }

                // Check if role exists before creating user
                if (!await _roleManager.RoleExistsAsync(model.UserType))
                {
                    return BadRequest("Invalid role specified");
                }

                ApplicationUser user;
                switch (model.UserType)
                {
                    case "Member":
                        user = new Member
                        {
                            UserName = model.Email,
                            Email = model.Email,
                            FullName = model.FullName,
                            PhoneNumber = model.PhoneNumber,
                            EmailConfirmed = false,
                            JoinDate = DateTime.UtcNow
                        };
                        break;
                    case "Admin":
                        user = new Admin
                        {
                            UserName = model.Email,
                            Email = model.Email,
                            FullName = model.FullName,
                            PhoneNumber = model.PhoneNumber,
                            EmailConfirmed = false
                        };
                        break;
                    case "Staff":
                        user = new Staff
                        {
                            UserName = model.Email,
                            Email = model.Email,
                            FullName = model.FullName,
                            PhoneNumber = model.PhoneNumber,
                            EmailConfirmed = false
                        };
                        break;
                    default:
                        return BadRequest("Invalid user type");
                }

                var result = await _userManager.CreateAsync(user, model.Password);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }

                // Generate email confirmation token
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                var confirmationLink = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?token={encodedToken}&email={WebUtility.UrlEncode(user.Email ?? string.Empty)}";

                // Send confirmation email
                if (user.Email != null)
                {
                    await _emailService.SendEmailConfirmationAsync(user.Email, confirmationLink);
                }

                // Assign role based on user type
                var roleResult = await _userManager.AddToRoleAsync(user, model.UserType);
                if (!roleResult.Succeeded)
                {
                    // If role assignment fails, delete the user and return error
                    await _userManager.DeleteAsync(user);
                    return BadRequest("Failed to assign role to user");
                }

                // Generate JWT token
                var jwtToken = await _jwtService.GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Save refresh token
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                var roles = await _userManager.GetRolesAsync(user);
                var permissions = await GetPermissionsForRoles(roles);

                return Ok(new AuthResponse
                {
                    Token = jwtToken,
                    UserId = user.Id,
                    Email = user.Email ?? string.Empty,
                    FullName = user.FullName ?? string.Empty,
                    TokenExpiration = DateTime.UtcNow.AddDays(1),
                    Permissions = permissions,
                    SessionId = Guid.NewGuid().ToString(),
                    Roles = roles.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return StatusCode(500, "An error occurred during registration");
            }
        }

        [HttpGet("confirm-email")]
        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string token, [FromQuery] string email)
        {
            try
            {
                if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Token or email is empty");
                    return BadRequest("Token and email are required");
                }

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning($"User not found for email: {email}");
                    return BadRequest("Invalid email");
                }

                // Check if email is already confirmed
                if (user.EmailConfirmed)
                {
                    _logger.LogInformation($"Email already confirmed for user: {email}");
                    if (Request.Method == "GET")
                    {
                        var html = $@"
                            <html>
                                <head>
                                    <title>Email Already Confirmed</title>
                                    <style>
                                        body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                                        .info {{ color: #2196F3; }}
                                        .button {{ 
                                            background-color: #2196F3;
                                            border: none;
                                            color: white;
                                            padding: 15px 32px;
                                            text-align: center;
                                            text-decoration: none;
                                            display: inline-block;
                                            font-size: 16px;
                                            margin: 4px 2px;
                                            cursor: pointer;
                                            border-radius: 4px;
                                        }}
                                    </style>
                                </head>
                                <body>
                                    <h1 class='info'>Email Already Confirmed</h1>
                                    <p>Your email has already been confirmed. You can login to your account.</p>
                                    <a href='{_configuration["FrontendUrl"]}/login' class='button'>Go to Login</a>
                                </body>
                            </html>";
                        return Content(html, "text/html");
                    }
                    return Ok(new { message = "Email is already confirmed. You can login to your account." });
                }

                // Decode the token
                try
                {
                    var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
                    _logger.LogInformation($"Attempting to confirm email for user: {email}");
                    
                    var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                    if (result.Succeeded)
                    {
                        _logger.LogInformation($"Email confirmed successfully for user: {email}");
                        
                        // If it's a GET request (from email link), return HTML
                        if (Request.Method == "GET")
                        {
                            var html = $@"
                                <html>
                                    <head>
                                        <title>Email Confirmation</title>
                                        <style>
                                            body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                                            .success {{ color: green; }}
                                            .button {{ 
                                                background-color: #4CAF50;
                                                border: none;
                                                color: white;
                                                padding: 15px 32px;
                                                text-align: center;
                                                text-decoration: none;
                                                display: inline-block;
                                                font-size: 16px;
                                                margin: 4px 2px;
                                                cursor: pointer;
                                                border-radius: 4px;
                                            }}
                                        </style>
                                    </head>
                                    <body>
                                        <h1 class='success'>Email Confirmed Successfully!</h1>
                                        <p>Your email has been confirmed. You can now login to your account.</p>
                                        <a href='{_configuration["FrontendUrl"]}/login' class='button'>Go to Login</a>
                                    </body>
                                </html>";
                            return Content(html, "text/html");
                        }

                        return Ok(new { message = "Email confirmed successfully. You can now login." });
                    }

                    _logger.LogWarning($"Failed to confirm email for user: {email}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    return BadRequest(result.Errors);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error decoding token for user: {email}");
                    return BadRequest("Invalid token format");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming email");
                if (Request.Method == "GET")
                {
                    var html = $@"
                        <html>
                            <head>
                                <title>Email Confirmation Error</title>
                                <style>
                                    body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; }}
                                    .error {{ color: red; }}
                                </style>
                            </head>
                            <body>
                                <h1 class='error'>Error Confirming Email</h1>
                                <p>An error occurred while confirming your email. Please try again or contact support.</p>
                            </body>
                        </html>";
                    return Content(html, "text/html");
                }
                return StatusCode(500, "An error occurred while confirming email");
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

                if (!user.EmailConfirmed)
                {
                    return BadRequest("Please confirm your email before logging in");
                }

                var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
                if (!result.Succeeded)
            {
                return Unauthorized("Invalid email or password");
            }

                var token = await _jwtService.GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();

                // Save refresh token
                user.RefreshToken = refreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                var roles = await _userManager.GetRolesAsync(user);
                var permissions = await GetPermissionsForRoles(roles);

                return Ok(new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                    FullName = user.FullName,
                    TokenExpiration = DateTime.UtcNow.AddDays(1),
                    Permissions = permissions,
                    SessionId = Guid.NewGuid().ToString(),
                    Roles = roles.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user login");
                return StatusCode(500, "An error occurred during login");
            }
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken(string refreshToken)
        {
            try
            {
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

                if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                {
                    return Unauthorized("Invalid refresh token");
                }

                var token = await _jwtService.GenerateJwtToken(user);
                var newRefreshToken = GenerateRefreshToken();

                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                return Ok(new { Token = token, RefreshToken = newRefreshToken });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");
                return StatusCode(500, "An error occurred while refreshing token");
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    // Don't reveal that the user does not exist
                    return Ok("If your email is registered, you will receive a password reset link");
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                var resetLink = $"{_configuration["FrontendUrl"]}/reset-password?token={encodedToken}&email={user.Email}";

                if (user.Email != null)
                {
                    await _emailService.SendPasswordResetAsync(user.Email, resetLink);
                }

                return Ok("If your email is registered, you will receive a password reset link");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing forgot password request");
                return StatusCode(500, "An error occurred while processing your request");
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(model.Email);
                if (user == null)
                {
                    return BadRequest("Invalid request");
                }

                var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.ResetToken));
                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);

                if (result.Succeeded)
                {
                    return Ok("Password has been reset successfully");
                }

                return BadRequest(result.Errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password");
                return StatusCode(500, "An error occurred while resetting password");
            }
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    var user = await _userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        user.RefreshToken = string.Empty;
                        user.RefreshTokenExpiryTime = DateTime.UtcNow;
                        await _userManager.UpdateAsync(user);
                    }
                }

                await _signInManager.SignOutAsync();
                return Ok("Logged out successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user logout");
                return StatusCode(500, "An error occurred during logout");
            }
        }

        [Authorize]
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

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task<List<string>> GetPermissionsForRoles(IList<string> roles)
        {
            var permissions = new List<string>();
            foreach (var roleName in roles)
            {
                var role = await _roleManager.FindByNameAsync(roleName);
                if (role != null)
                {
                    var claims = await _roleManager.GetClaimsAsync(role);
                    permissions.AddRange(claims
                        .Where(c => c.Type == "Permission")
                        .Select(c => c.Value));
                }
            }
            return permissions.Distinct().ToList();
        }
    }
} 