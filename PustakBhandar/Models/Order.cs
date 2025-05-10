using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace PustakBhandar.Models
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("memberId")]
        public string MemberId { get; set; } = string.Empty;

        [BsonElement("orderDate")]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [BsonElement("totalAmount")]
        public decimal TotalAmount { get; set; }

        [BsonElement("discountApplied")]
        public decimal DiscountApplied { get; set; }

        [BsonElement("claimCode")]
        public string ClaimCode { get; set; } = string.Empty;

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed

        [BsonElement("processedBy")]
        public string? ProcessedBy { get; set; } // Staff ID

        [BsonElement("items")]
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        [BsonElement("bookId")]
        public string BookId { get; set; } = string.Empty;

        [BsonElement("quantity")]
        public int Quantity { get; set; }

        [BsonElement("price")]
        public decimal Price { get; set; }
    }
} 