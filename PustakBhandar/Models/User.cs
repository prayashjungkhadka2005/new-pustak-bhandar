using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace PustakBhandar.Models
{
    public abstract class User // Made abstract as it might not be instantiated directly
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Member : User
    {
        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("roleId")]
        public string RoleId { get; set; } = "member"; // Default role for Member

        [BsonElement("joinDate")]
        public DateTime JoinDate { get; set; } = DateTime.UtcNow;

        [BsonElement("totalOrders")]
        public int TotalOrders { get; set; }

        [BsonElement("discountEarned")]
        public decimal DiscountEarned { get; set; }

        [BsonElement("whitelist")]
        public List<string> Whitelist { get; set; } = new List<string>(); // Book IDs

        [BsonElement("cart")]
        public List<string> Cart { get; set; } = new List<string>(); // Cart IDs

        [BsonElement("orders")]
        public List<string> Orders { get; set; } = new List<string>(); // Order IDs
    }

    public class Admin : User
    {
        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("roleId")]
        public string RoleId { get; set; } = "admin"; // Default role for Admin
    }

    public class Staff : User
    {
        [BsonElement("fullName")]
        public string FullName { get; set; } = string.Empty;

        [BsonElement("email")]
        public string Email { get; set; } = string.Empty;

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = string.Empty;

        [BsonElement("roleId")]
        public string RoleId { get; set; } = "staff"; // Default role for Staff
    }
} 