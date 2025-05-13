namespace PustakBhandar.Constants
{
    public static class Permissions
    {
        // Admin Permissions
        public const string ManageBooks = "manage_books";
        public const string ManageDiscounts = "manage_discounts";
        public const string ManageAnnouncements = "manage_announcements";
        public const string ViewOrders = "view_orders";
        public const string ViewUsers = "view_users";
        public const string ManageUsers = "manage_users";
        public const string ViewReports = "view_reports";
        public const string ViewNotifications = "view_notifications";

        // Staff Permissions
        public const string ProcessOrders = "process_orders";
        public const string UpdateOrderStatus = "update_order_status";

        // Member Account Management
        public const string ViewProfile = "view_profile";
        public const string UpdateProfile = "update_profile";

        // Member Book Interaction
        public const string ViewBooks = "view_books";
        public const string ViewBookDetails = "view_book_details";
        public const string AddToWishlist = "add_to_wishlist";
        public const string RemoveFromWishlist = "remove_from_wishlist";

        // Member Cart Management
        public const string ViewCart = "view_cart";
        public const string AddToCart = "add_to_cart";
        public const string UpdateCart = "update_cart";
        public const string RemoveFromCart = "remove_from_cart";

        // Member Order Management
        public const string PlaceOrder = "place_order";
        public const string ViewOrderHistory = "view_orders";
        public const string ViewOrderClaimCode = "view_order_claim_code";
        public const string ApplyDiscounts = "apply_discounts";

        // Member Review Management
        public const string AddReview = "add_review";
        public const string ViewReviews = "view_reviews";

        // Member Dashboard
        public const string ViewSelfDashboard = "view_self_dashboard";

        // Get all permissions
        public static List<string> GetAllPermissions()
        {
            return new List<string>
            {
                // Admin Permissions
                ManageBooks,
                ManageDiscounts,
                ManageAnnouncements,
                ViewOrders,
                ViewUsers,
                ManageUsers,
                ViewReports,
                ViewNotifications,

                // Staff Permissions
                ProcessOrders,
                UpdateOrderStatus,

                // Member Permissions
                ViewProfile,
                UpdateProfile,
                ViewBooks,
                ViewBookDetails,
                AddToWishlist,
                RemoveFromWishlist,
                ViewCart,
                AddToCart,
                UpdateCart,
                RemoveFromCart,
                PlaceOrder,
                ViewOrderHistory,
                ViewOrderClaimCode,
                ApplyDiscounts,
                AddReview,
                ViewReviews,
                ViewNotifications,
                ViewSelfDashboard
            };
        }

        // Get member permissions
        public static List<string> GetMemberPermissions()
        {
            return new List<string>
            {
                ViewProfile,
                UpdateProfile,
                ViewBooks,
                ViewBookDetails,
                AddToWishlist,
                RemoveFromWishlist,
                ViewCart,
                AddToCart,
                UpdateCart,
                RemoveFromCart,
                PlaceOrder,
                ViewOrderHistory,
                ViewOrderClaimCode,
                ApplyDiscounts,
                AddReview,
                ViewReviews,
                ViewNotifications,
                ViewSelfDashboard
            };
        }

        // Get staff permissions
        public static List<string> GetStaffPermissions()
        {
            return new List<string>
            {
                ViewOrders,           // Can view all assigned orders
                ProcessOrders,        // Can process orders
                UpdateOrderStatus,    // Can update order status
                ViewNotifications     // Can view notifications
            };
        }

        // Get admin permissions
        public static List<string> GetAdminPermissions()
        {
            return new List<string>
            {
                ManageBooks,
                ManageDiscounts,
                ManageAnnouncements,
                ViewOrders,
                ViewUsers,
                ManageUsers,
                ViewReports,
                ViewNotifications
            };
        }
    }
} 