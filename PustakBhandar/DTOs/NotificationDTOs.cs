namespace PustakBhandar.DTOs
{
    public class NotificationResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public bool IsRead { get; set; }
    }
} 