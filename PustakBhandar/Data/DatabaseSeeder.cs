using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using PustakBhandar.Models;

namespace PustakBhandar.Data
{
    public class DatabaseSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<DatabaseSeeder> _logger;
        private readonly IConfiguration _configuration;

        public DatabaseSeeder(
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            ILogger<DatabaseSeeder> logger,
            IConfiguration configuration)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task SeedRolesAsync()
        {
            try
            {
                var roles = new Dictionary<string, string[]>
                {
                    {
                        "Admin", new[] {
                            "manage_books",
                            "manage_discounts",
                            "manage_announcements",
                            "manage_users",
                            "view_reports"
                        }
                    },
                    {
                        "Staff", new[] {
                            "process_orders",
                            "manage_claim_codes",
                            "view_orders"
                        }
                    },
                    {
                        "Member", new[] {
                            "place_orders",
                            "manage_cart",
                            "leave_reviews",
                            "view_books"
                        }
                    }
                };

                foreach (var role in roles)
                {
                    if (!await _roleManager.RoleExistsAsync(role.Key))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(role.Key));
                        _logger.LogInformation($"Created role: {role.Key}");

                        var identityRole = await _roleManager.FindByNameAsync(role.Key);
                        if (identityRole != null)
                        {
                            foreach (var permission in role.Value)
                            {
                                await _roleManager.AddClaimAsync(identityRole, new Claim("Permission", permission));
                                _logger.LogInformation($"Added permission {permission} to role {role.Key}");
                            }
                        }
                    }
                }

                // Create default admin user if it doesn't exist
                await CreateDefaultAdminUserAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database.");
                throw;
            }
        }

        private async Task CreateDefaultAdminUserAsync()
        {
            try
            {
                var adminEmail = _configuration["DefaultAdmin:Email"] ?? "admin@pustakbhandar.com";
                var adminPassword = _configuration["DefaultAdmin:Password"] ?? "Admin@123";

                var adminUser = await _userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    adminUser = new ApplicationUser
                    {
                        UserName = adminEmail,
                        Email = adminEmail,
                        FullName = "System Administrator",
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(adminUser, adminPassword);
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(adminUser, "Admin");
                        _logger.LogInformation("Default admin user created successfully");
                    }
                    else
                    {
                        _logger.LogError($"Failed to create default admin user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating default admin user");
            }
        }
    }
} 