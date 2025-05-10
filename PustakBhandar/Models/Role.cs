using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PustakBhandar.Models
{
    public class Role
    {
        [BsonId]
        public string Id { get; set; } = string.Empty;

        [BsonElement("roleName")]
        public string RoleName { get; set; } = string.Empty;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
} 