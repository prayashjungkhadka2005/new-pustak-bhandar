using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

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

        [BsonElement("authorId")]
        public string AuthorId { get; set; } = string.Empty;

        [BsonElement("genreId")]
        public string GenreId { get; set; } = string.Empty;

        [BsonElement("publisherId")]
        public string PublisherId { get; set; } = string.Empty;

        [BsonElement("format")]
        public string Format { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("publicationDate")]
        public DateTime PublicationDate { get; set; }

        [BsonElement("stockQuantity")]
        public int StockQuantity { get; set; }

        [BsonElement("rating")]
        public double Rating { get; set; }

        [BsonElement("onSale")]
        public bool OnSale { get; set; }

        [BsonElement("discountId")]
        public string? DiscountId { get; set; }
    }
}
