using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace PustakBhandar.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("firstName")]
        public string FirstName { get; set; } = string.Empty;

        [BsonElement("lastName")]
        public string LastName { get; set; } = string.Empty;

        [BsonElement("role")]
        public string Role { get; set; } = "Member"; // Member, Admin, Staff

        [BsonElement("membershipId")]
        public string MembershipId { get; set; } = string.Empty;

        [BsonElement("whitelist")]
        public List<string> Whitelist { get; set; } = new List<string>(); // Book IDs

        [BsonElement("cart")]
        public Cart Cart { get; set; } = new Cart();

        [BsonElement("orders")]
        public List<Order> Orders { get; set; } = new List<Order>();

        [BsonElement("successfulOrdersCount")]
        public int SuccessfulOrdersCount { get; set; }

        [BsonElement("hasStackableDiscount")]
        public bool HasStackableDiscount { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("lastLogin")]
        public DateTime? LastLogin { get; set; }
    }

    public class Cart
    {
        [BsonElement("items")]
        public List<CartItem> Items { get; set; } = new List<CartItem>();

        [BsonElement("totalAmount")]
        public decimal TotalAmount { get; set; }

        [BsonElement("discountAmount")]
        public decimal DiscountAmount { get; set; }

        [BsonElement("finalAmount")]
        public decimal FinalAmount { get; set; }
    }

    public class CartItem
    {
        [BsonElement("bookId")]
        public string BookId { get; set; } = string.Empty;

        [BsonElement("quantity")]
        public int Quantity { get; set; }

        [BsonElement("price")]
        public decimal Price { get; set; }
    }

    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("items")]
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();

        [BsonElement("totalAmount")]
        public decimal TotalAmount { get; set; }

        [BsonElement("discountAmount")]
        public decimal DiscountAmount { get; set; }

        [BsonElement("finalAmount")]
        public decimal FinalAmount { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled, Completed

        [BsonElement("claimCode")]
        public string ClaimCode { get; set; } = string.Empty;

        [BsonElement("orderDate")]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [BsonElement("pickupDate")]
        public DateTime? PickupDate { get; set; }

        [BsonElement("cancellationDate")]
        public DateTime? CancellationDate { get; set; }
    }

    public class OrderItem
    {
        [BsonElement("bookId")]
        public string BookId { get; set; } = string.Empty;

        [BsonElement("quantity")]
        public int Quantity { get; set; }

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("discount")]
        public decimal Discount { get; set; }
    }
} 