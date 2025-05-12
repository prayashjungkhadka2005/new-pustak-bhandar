using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace PustakBhandar.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailConfirmationAsync(string email, string confirmationLink)
        {
            try
            {
                var subject = "Confirm your email";
                var body = $@"
                    <h2>Welcome to PustakBhandar!</h2>
                    <p>Please confirm your email by clicking the link below:</p>
                    <p><a href='{confirmationLink}'>Confirm Email</a></p>
                    <p>If you did not create an account, please ignore this email.</p>";

                await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email confirmation to {Email}", email);
                throw;
            }
        }

        public async Task SendPasswordResetAsync(string email, string resetLink)
        {
            try
            {
                var subject = "Reset your password";
                var body = $@"
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password. Click the link below to proceed:</p>
                    <p><a href='{resetLink}'>Reset Password</a></p>
                    <p>If you did not request a password reset, please ignore this email.</p>";

                await SendEmailAsync(email, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending password reset email to {Email}", email);
                throw;
            }
        }

        private async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(_configuration["Email:From"] ?? throw new InvalidOperationException("Email:From not configured"));
                message.To.Add(new MailAddress(to));
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                using var client = new SmtpClient(_configuration["Email:SmtpServer"])
                {
                    Port = int.Parse(_configuration["Email:Port"] ?? "587"),
                    Credentials = new System.Net.NetworkCredential(
                        _configuration["Email:Username"],
                        _configuration["Email:Password"]
                    ),
                    EnableSsl = true
                };

                await client.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {Email}", to);
                throw;
            }
        }
    }
} 