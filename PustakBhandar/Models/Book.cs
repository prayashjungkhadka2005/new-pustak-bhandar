using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace PustakBhandar.Models
{
    public class Book
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("isbn")]
        public string ISBN { get; set; } = string.Empty;

        [BsonElement("author")]
        public string Author { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("publishedDate")]
        public DateTime PublishedDate { get; set; }

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("genre")]
        public string Genre { get; set; } = string.Empty;

        [BsonElement("language")]
        public string Language { get; set; } = string.Empty;

        [BsonElement("format")]
        public string Format { get; set; } = string.Empty;

        [BsonElement("publisher")]
        public string Publisher { get; set; } = string.Empty;

        [BsonElement("stockQuantity")]
        public int StockQuantity { get; set; }

        [BsonElement("averageRating")]
        public double AverageRating { get; set; }

        [BsonElement("category")]
        public string Category { get; set; } = string.Empty;

        [BsonElement("isOnSale")]
        public bool IsOnSale { get; set; }

        [BsonElement("discountPercentage")]
        public decimal DiscountPercentage { get; set; }

        [BsonElement("discountStartDate")]
        public DateTime? DiscountStartDate { get; set; }

        [BsonElement("discountEndDate")]
        public DateTime? DiscountEndDate { get; set; }

        [BsonElement("reviews")]
        public List<Review> Reviews { get; set; } = new List<Review>();

        [BsonElement("totalSales")]
        public int TotalSales { get; set; }

        [BsonElement("isAwardWinner")]
        public bool IsAwardWinner { get; set; }

        [BsonElement("isNewRelease")]
        public bool IsNewRelease { get; set; }

        [BsonElement("isNewArrival")]
        public bool IsNewArrival { get; set; }

        [BsonElement("isComingSoon")]
        public bool IsComingSoon { get; set; }
    }

    public class Review
    {
        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("rating")]
        public int Rating { get; set; }

        [BsonElement("comment")]
        public string Comment { get; set; } = string.Empty;

        [BsonElement("reviewDate")]
        public DateTime ReviewDate { get; set; } = DateTime.UtcNow;
    }
}
