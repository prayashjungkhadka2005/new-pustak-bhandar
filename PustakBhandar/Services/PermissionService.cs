using Microsoft.AspNetCore.Identity;
using PustakBhandar.Constants;
using System.Security.Claims;
using Microsoft.Extensions.Logging;

namespace PustakBhandar.Services
{
    public class PermissionService
    {
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<PermissionService> _logger;

        public PermissionService(RoleManager<IdentityRole> roleManager, ILogger<PermissionService> logger)
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task SeedPermissions()
        {
            try
            {
                // Ensure roles exist
                await EnsureRoleExists("Admin");
                await EnsureRoleExists("Staff");
                await EnsureRoleExists("Member");

                // Admin Role Permissions
                var adminRole = await _roleManager.FindByNameAsync("Admin");
                if (adminRole != null)
                {
                    _logger.LogInformation("Seeding Admin permissions...");
                    // Add all permissions to Admin role
                    foreach (var permission in Permissions.GetAdminPermissions())
                    {
                        var claim = new Claim("Permission", permission);
                        if (!await HasClaim(adminRole, claim))
                        {
                            await _roleManager.AddClaimAsync(adminRole, claim);
                            _logger.LogInformation($"Added permission {permission} to Admin role");
                        }
                    }
                }

                // Staff Role Permissions
                var staffRole = await _roleManager.FindByNameAsync("Staff");
                if (staffRole != null)
                {
                    _logger.LogInformation("Seeding Staff permissions...");
                    
                    // First, remove any existing permissions
                    var existingClaims = await _roleManager.GetClaimsAsync(staffRole);
                    foreach (var claim in existingClaims.Where(c => c.Type == "Permission"))
                    {
                        await _roleManager.RemoveClaimAsync(staffRole, claim);
                        _logger.LogInformation($"Removed permission {claim.Value} from Staff role");
                    }

                    // Add only the allowed staff permissions
                    var staffPermissions = new[]
                    {
                        Permissions.ViewOrders,           // Can view all assigned orders
                        Permissions.ProcessOrders,        // Can process orders
                        Permissions.UpdateOrderStatus,    // Can update order status
                        Permissions.ViewNotifications     // Can view notifications
                    };

                    foreach (var permission in staffPermissions)
                    {
                        var claim = new Claim("Permission", permission);
                        await _roleManager.AddClaimAsync(staffRole, claim);
                        _logger.LogInformation($"Added permission {permission} to Staff role");
                    }
                }

                // Member Role Permissions
                var memberRole = await _roleManager.FindByNameAsync("Member");
                if (memberRole != null)
                {
                    _logger.LogInformation("Seeding Member permissions...");
                    // Add member permissions
                    foreach (var permission in Permissions.GetMemberPermissions())
                    {
                        var claim = new Claim("Permission", permission);
                        if (!await HasClaim(memberRole, claim))
                        {
                            await _roleManager.AddClaimAsync(memberRole, claim);
                            _logger.LogInformation($"Added permission {permission} to Member role");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding permissions");
                throw;
            }
        }

        private async Task EnsureRoleExists(string roleName)
        {
            if (!await _roleManager.RoleExistsAsync(roleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(roleName));
                _logger.LogInformation($"Created role: {roleName}");
            }
        }

        private async Task<bool> HasClaim(IdentityRole role, Claim claim)
        {
            var claims = await _roleManager.GetClaimsAsync(role);
            return claims.Any(c => c.Type == claim.Type && c.Value == claim.Value);
        }
    }
} 