using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using PustakBhandar.Models;

namespace PustakBhandar.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var mongoClient = new MongoClient(connectionString);
            _database = mongoClient.GetDatabase("PustakBhandarDB");
        }

        public IMongoCollection<Book> Books => _database.GetCollection<Book>("Books");
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<Announcement> Announcements => _database.GetCollection<Announcement>("Announcements");
    }
}
