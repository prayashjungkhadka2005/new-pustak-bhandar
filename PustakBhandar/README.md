# PustakBhandar Backend API Documentation

## Table of Contents
- [Features Overview](#features-overview)
- [API Routes](#api-routes)
  - [Authentication](#authentication)
  - [Member Features](#member-features)
  - [Admin Features](#admin-features)
  - [Staff Features](#staff-features)
  - [Book Management](#book-management)
  - [Discount and Promotions](#discount-and-promotions)
  - [Notifications](#notifications)
  - [Announcements](#announcements)

## Features Overview

### 1. User Management and Authentication
- User Registration (Member, Admin, Staff)
- Email Verification (Required)
- User Login with JWT Authentication
- Role-Based Access Control (RBAC)
- Password Reset (Forgot Password and Reset Password)
- Logout and Session Management
- Refresh Token Support

### 2. Member Features
- View and Edit Profile
- Add Books to Whitelist
- Add Books to Cart
- Place Orders
- Leave Reviews (Only for purchased books)
- View Claim Codes for In-Store Pickup
- View Order History
- View Eligible Discounts
- Receive Notifications

### 3. Admin Features
- Manage Books (CRUD)
- Manage Discounts
- Create Timed Announcements
- View All Orders
- View All Members
- Manage Inventory

### 4. Staff Features
- Process Orders with Claim Code
- View All Orders
- Update Order Status

### 5. Book Management and Catalogue
- Browse and Search Books
- Filter Books by Genre, Author, Publisher, Price, Rating, Format
- Sort Books by Date, Price, Rating, Popularity
- View Book Details

### 6. Discount and Promotions
- 5% discount for 5+ books
- 10% stackable discount after 10 successful orders
- View Eligible Discounts
- Manage Discounts (Admin)

### 7. Notifications
- Order Claim Code Notifications
- Deal and Announcement Notifications
- View Notifications

### 8. Announcements
- Timed Announcements for Deals
- New Arrivals Notifications
- Informational Messages
- Manage Announcements (Admin Only)

## API Routes

### Authentication
```
POST /api/auth/register          - Register new user (Member/Admin/Staff)
GET  /api/auth/confirm-email     - Confirm email address
POST /api/auth/login            - Login and get JWT token
POST /api/auth/refresh-token    - Get new JWT token using refresh token
POST /api/auth/forgot-password  - Request password reset link
POST /api/auth/reset-password   - Reset password using token
POST /api/auth/logout           - Logout and invalidate tokens
GET  /api/auth/me               - Get current user profile
PUT  /api/auth/profile          - Update user profile
POST /api/auth/change-password  - Change user password
```

#### Authentication Response Format
```json
{
    "token": "JWT_TOKEN",
    "sessionId": "GUID",
    "userId": "USER_ID",
    "email": "user@example.com",
    "fullName": "User Name",
    "permissions": [
        "permission1",
        "permission2"
    ],
    "tokenExpiration": "2025-05-13T03:48:31.763796Z"
}
```

#### Predefined Roles and Permissions
- **Admin**:
  - manage_books
  - manage_discounts
  - manage_announcements
  - manage_users
  - view_reports

- **Staff**:
  - process_orders
  - manage_claim_codes
  - view_orders

- **Member**:
  - place_orders
  - manage_cart
  - leave_reviews
  - view_books

### Member Features
```
GET    /api/members/profile           - Get member profile
PUT    /api/members/profile           - Update profile
GET    /api/members/whitelist         - Get whitelist
POST   /api/members/whitelist         - Add book to whitelist
DELETE /api/members/whitelist/{bookId} - Remove book from whitelist
GET    /api/members/cart              - View cart
POST   /api/members/cart              - Add book to cart
PUT    /api/members/cart/{itemId}     - Update cart item quantity
DELETE /api/members/cart/{itemId}     - Remove cart item
POST   /api/members/orders            - Place an order
GET    /api/members/orders            - View order history
GET    /api/members/orders/{orderId}/claim-code - View claim code for specific order
GET    /api/members/discounts         - View eligible discounts
POST   /api/members/reviews           - Leave a review
GET    /api/members/notifications     - View notifications
```

### Admin Features
```
GET    /api/admin/books                    - Get all books
POST   /api/admin/books                    - Add a new book
PUT    /api/admin/books/{bookId}           - Update book details
DELETE /api/admin/books/{bookId}           - Delete a book
GET    /api/admin/discounts                - Get all discounts
POST   /api/admin/discounts                - Create a new discount
PUT    /api/admin/discounts/{discountId}   - Update discount
DELETE /api/admin/discounts/{discountId}   - Delete a discount
GET    /api/admin/announcements            - Get all announcements
POST   /api/admin/announcements            - Create announcement
PUT    /api/admin/announcements/{id}       - Update announcement
DELETE /api/admin/announcements/{id}       - Delete announcement
GET    /api/admin/orders                   - View all orders
GET    /api/admin/members                  - View all members
GET    /api/admin/inventory                - View and manage inventory
```

### Staff Features
```
GET  /api/staff/orders                    - View all orders for processing
PUT  /api/staff/orders/{orderId}/process  - Process order using claim code
PUT  /api/staff/orders/{orderId}/status   - Update order status
```

### Book Management
```
GET /api/books                    - Browse books with pagination
GET /api/books/search            - Search books by title, ISBN, or description
GET /api/books/{bookId}          - View book details
GET /api/books/genre/{genreId}   - Filter books by genre
GET /api/books/author/{authorId} - Filter books by author
GET /api/books/publisher/{id}    - Filter books by publisher
GET /api/books/sort             - Sort books by specified criteria
```

### Discount and Promotions
```
GET    /api/discounts                - View active discounts
POST   /api/discounts                - Create new discount (Admin only)
PUT    /api/discounts/{discountId}   - Update discount
DELETE /api/discounts/{discountId}   - Delete discount
```

### Notifications
```
GET  /api/notifications                    - View notifications
POST /api/notifications                    - Send notification (Admin/Staff only)
PUT  /api/notifications/{id}/mark-read     - Mark notification as read
```

### Announcements
```
GET    /api/announcements            - View active announcements
POST   /api/announcements            - Create timed announcement (Admin only)
PUT    /api/announcements/{id}       - Update announcement
DELETE /api/announcements/{id}       - Delete announcement
```

## Summary
- Total API Routes: 45
- Key Functional Areas:
  - User Authentication and Session Management
  - Member Actions (Wishlist, Cart, Reviews, Orders, Claim Codes)
  - Admin Actions (CRUD, Discounts, Timed Announcements)
  - Staff Actions (Order Processing)
  - Book Management (Browsing, Searching, Filtering, Sorting)
  - Notifications and Announcements
  - Discount System (Stackable Discounts) 