using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PustakBhandar.Models
{
    public class Notification
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("orderId")]
        public string OrderId { get; set; } = string.Empty;

        [BsonElement("message")]
        public string Message { get; set; } = string.Empty;

        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [BsonElement("isRead")]
        public bool IsRead { get; set; }

        [BsonElement("memberId")]
        public string MemberId { get; set; } = string.Empty;
    }
} 