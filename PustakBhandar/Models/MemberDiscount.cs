using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PustakBhandar.Models
{
    public class MemberDiscount
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("memberId")]
        public string MemberId { get; set; } = string.Empty;

        [BsonElement("discountId")]
        public string DiscountId { get; set; } = string.Empty;

        [BsonElement("isStackable")]
        public bool IsStackable { get; set; }

        [BsonElement("appliedDate")]
        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

        [BsonElement("isActive")]
        public bool IsActive { get; set; }
    }
} 