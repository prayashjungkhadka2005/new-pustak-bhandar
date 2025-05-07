using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using PustakBhandar.Data;
using PustakBhandar.DTOs;
using PustakBhandar.Models;
using PustakBhandar.Services;
using System.Security.Cryptography;
using System.Text;
using System.Security.Claims;

namespace PustakBhandar.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _configuration;

        public AuthController(MongoDbContext context, JwtService jwtService, IConfiguration configuration)
        {
            _context = context;
            _jwtService = jwtService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            // Check if user already exists
            var existingUser = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                return BadRequest("User with this email already exists");
            }

            // Validate role
            string role = "Member";
            if (!string.IsNullOrEmpty(request.Role))
            {
                var allowedRoles = new[] { "Member", "Admin" };
                if (!allowedRoles.Contains(request.Role))
                {
                    return BadRequest("Invalid role specified");
                }
                role = request.Role;
            }

            // Generate membership ID
            var membershipId = GenerateMembershipId();

            // Create new user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Role = role,
                MembershipId = membershipId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.InsertOneAsync(user);

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                Role = user.Role,
                MembershipId = user.MembershipId
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _context.Users.Find(u => u.Email == request.Email).FirstOrDefaultAsync();
            if (user == null)
            {
                return Unauthorized("Invalid email or password");
            }

            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid email or password");
            }

            // Update last login
            user.LastLogin = DateTime.UtcNow;
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

            // Generate JWT token
            var token = _jwtService.GenerateToken(user);

            return new AuthResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                Role = user.Role,
                MembershipId = user.MembershipId
            };
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                return NotFound("User not found");
            }

            return new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Role,
                user.MembershipId,
                user.LastLogin
            };
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateMembershipId()
        {
            // Generate a unique membership ID (e.g., PB-2024-XXXXX)
            var random = new Random();
            var number = random.Next(10000, 99999);
            return $"PB-{DateTime.UtcNow.Year}-{number}";
        }
    }
} 