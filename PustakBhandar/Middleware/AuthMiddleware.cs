using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using PustakBhandar.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace PustakBhandar.Middleware
{
    public class AuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<AuthMiddleware> _logger;
        private readonly IConfiguration _configuration;

        public AuthMiddleware(
            RequestDelegate next, 
            ILogger<AuthMiddleware> logger,
            IConfiguration configuration)
        {
            _next = next;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                // Skip middleware for non-API routes and login/register endpoints
                if (!context.Request.Path.StartsWithSegments("/api") ||
                    context.Request.Path.StartsWithSegments("/api/auth"))
                {
                    await _next(context);
                    return;
                }

                // Check if the endpoint requires admin role
                var endpoint = context.GetEndpoint();
                var requiresAdmin = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>()?.Roles?.Contains("Admin") ?? false;

                if (requiresAdmin)
                {
                    var authHeader = context.Request.Headers["Authorization"].ToString();
                    _logger.LogInformation($"Auth header: {authHeader}");

                    if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                    {
                        await SendResponse(context, HttpStatusCode.Unauthorized, new
                        {
                            status = 401,
                            message = "Authentication required. Please login.",
                            error = "Unauthorized",
                            details = "No token provided or invalid format"
                        });
                        return;
                    }

                    var token = authHeader.Replace("Bearer ", "");
                    _logger.LogInformation($"Token: {token}");

                    try
                    {
                        var tokenHandler = new JwtSecurityTokenHandler();
                        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not found"));
                        
                        _logger.LogInformation($"JWT Key: {_configuration["Jwt:Key"]}");
                        _logger.LogInformation($"JWT Issuer: {_configuration["Jwt:Issuer"]}");
                        _logger.LogInformation($"JWT Audience: {_configuration["Jwt:Audience"]}");

                        var validationParameters = new TokenValidationParameters
                        {
                            ValidateIssuerSigningKey = true,
                            IssuerSigningKey = new SymmetricSecurityKey(key),
                            ValidateIssuer = true,
                            ValidIssuer = _configuration["Jwt:Issuer"],
                            ValidateAudience = true,
                            ValidAudience = _configuration["Jwt:Audience"],
                            ValidateLifetime = true,
                            ClockSkew = TimeSpan.Zero
                        };

                        SecurityToken validatedToken;
                        var principal = tokenHandler.ValidateToken(token, validationParameters, out validatedToken);
                        
                        var jwtToken = (JwtSecurityToken)validatedToken;
                        _logger.LogInformation($"Token claims: {JsonSerializer.Serialize(jwtToken.Claims.Select(c => new { c.Type, c.Value }))}");

                        // Check for role claim using the correct claim type
                        var userRole = jwtToken.Claims
                            .FirstOrDefault(x => x.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;

                        _logger.LogInformation($"User role from token: {userRole}");

                        if (string.IsNullOrEmpty(userRole) || userRole != "Admin")
                        {
                            _logger.LogWarning($"Unauthorized access attempt. User role: {userRole}");
                            await SendResponse(context, HttpStatusCode.Forbidden, new
                            {
                                status = 403,
                                message = "Access denied. Admin privileges required.",
                                error = "Forbidden",
                                details = $"User role '{userRole}' is not authorized"
                            });
                            return;
                        }

                        // If we get here, the user is an admin
                        _logger.LogInformation("Admin access granted");
                    }
                    catch (SecurityTokenExpiredException ex)
                    {
                        _logger.LogError(ex, "Token expired");
                        await SendResponse(context, HttpStatusCode.Unauthorized, new
                        {
                            status = 401,
                            message = "Token has expired. Please login again.",
                            error = "Unauthorized",
                            details = "Token expired"
                        });
                        return;
                    }
                    catch (SecurityTokenInvalidIssuerException ex)
                    {
                        _logger.LogError(ex, "Invalid issuer");
                        await SendResponse(context, HttpStatusCode.Unauthorized, new
                        {
                            status = 401,
                            message = "Invalid token. Please login again.",
                            error = "Unauthorized",
                            details = "Invalid token issuer"
                        });
                        return;
                    }
                    catch (SecurityTokenInvalidAudienceException ex)
                    {
                        _logger.LogError(ex, "Invalid audience");
                        await SendResponse(context, HttpStatusCode.Unauthorized, new
                        {
                            status = 401,
                            message = "Invalid token. Please login again.",
                            error = "Unauthorized",
                            details = "Invalid token audience"
                        });
                        return;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Token validation failed");
                        await SendResponse(context, HttpStatusCode.Unauthorized, new
                        {
                            status = 401,
                            message = "Invalid token. Please login again.",
                            error = "Unauthorized",
                            details = $"Token validation failed: {ex.Message}"
                        });
                        return;
                    }
                }

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred in the authentication middleware");
                await SendResponse(context, HttpStatusCode.InternalServerError, new
                {
                    status = 500,
                    message = "An internal server error occurred",
                    error = "Internal Server Error",
                    details = ex.Message
                });
            }
        }

        private async Task SendResponse(HttpContext context, HttpStatusCode statusCode, object response)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
} 