# PustakBhandar - Frontend

This is the frontend implementation of the PustakBhandar application, developed using **React, Tailwind CSS, and Vite**. The frontend connects to the backend API to provide a seamless user experience for members, staff, and admin users.

## 🚀 Project Structure

```
src/
├── assets/          # Static assets (images, icons, etc.)
├── components/      # Reusable components
│   ├── auth/        # Login, Register, ForgotPassword, ResetPassword, ChangePassword
│   ├── members/     # Profile, Cart, Wishlist, Orders, Reviews, Notifications, Discounts
│   ├── admin/       # Books, Discounts, Announcements, Orders, Members, Inventory
│   ├── staff/       # Orders, OrderProcessing, OrderStatus
│   └── shared/      # Header, Footer, Loader, Modal
├── context/         # Context API for state management
├── hooks/           # Custom hooks (e.g., useAuth, useCart, useNotifications)
├── layouts/         # Layout components (AdminLayout, MemberLayout, etc.)
├── pages/           # Main route pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── ForgotPassword.jsx
│   ├── ResetPassword.jsx
│   ├── Books.jsx
│   ├── BookDetails.jsx
│   ├── Profile.jsx
│   ├── Cart.jsx
│   ├── Wishlist.jsx
│   ├── Orders.jsx
│   ├── AdminDashboard.jsx
│   ├── StaffDashboard.jsx
│   └── NotFound.jsx
├── services/        # API service functions (auth.js, books.js, cart.js, etc.)
├── styles/          # Global Tailwind styles
├── utils/           # Utility functions (e.g., date formatter, API helper)
├── App.jsx          # Main application component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## 🛠️ Required Components and Pages

### 1. Authentication (Public Routes)
- Login (POST /api/auth/login)
- Register (POST /api/auth/register)
- Forgot Password (POST /api/auth/forgot-password)
- Reset Password (POST /api/auth/reset-password)
- Confirm Email (GET /api/auth/confirm-email)
- Profile Update (PUT /api/auth/profile)
- Change Password (POST /api/auth/change-password)
- Logout (POST /api/auth/logout)

### 2. Member Features (Protected Routes)
- Profile (GET /api/members/profile)
- Update Profile (PUT /api/members/profile)
- Cart (GET, POST, PUT, DELETE /api/members/cart)
- Wishlist (GET, POST, DELETE /api/members/whitelist)
- Orders (GET, POST /api/members/orders)
- Claim Code (GET /api/members/orders/{orderId}/claim-code)
- Discounts (GET /api/members/discounts)
- Reviews (POST /api/members/reviews)
- Notifications (GET /api/members/notifications)

### 3. Admin Features (Protected Routes)
- Books Management (GET, POST, PUT, DELETE /api/admin/books)
- Announcements Management (GET, POST, PUT, DELETE /api/admin/announcements)
- Discounts Management (GET, POST, PUT, DELETE /api/admin/discounts)
- Orders (GET /api/admin/orders)
- Members (GET /api/admin/members)
- Inventory Overview (GET /api/admin/inventory)

### 4. Staff Features (Protected Routes)
- Orders (GET /api/staff/orders)
- Order Processing (PUT /api/staff/orders/{orderId}/process)
- Update Order Status (PUT /api/staff/orders/{orderId}/status)

### 5. Shared Components
- Header
- Footer
- Notifications
- Modal
- Loader

## 📦 State Management
- Context API
  - AuthContext (User authentication and session handling)
  - CartContext (Cart management)
  - NotificationContext (Notifications and alerts)

## 🌐 API Integration
- All API endpoints are defined in `src/services/Api.js`.
- Implement reusable functions such as:
  - `login()`
  - `register()`
  - `getProfile()`
  - `fetchBooks()`
  - `addToCart()`
  - `processOrder()`

## 🌈 Tailwind Setup
- Custom Tailwind configuration located in `tailwind.config.js`.
- Global styles and base components defined in `src/styles/index.css`.

## ✅ Installation
```bash
npm install
```

## 🚀 Start the Development Server
```bash
npm run dev
```

## 🧪 Build for Production
```bash
npm run build
```

## 🛠️ Lint and Format
```bash
npm run lint
npm run format
```

## 📦 Environment Variables
- Create a `.env` file in the root directory with the following variables:

```
VITE_API_BASE_URL=https://localhost:7120/api
```

Ensure that the backend server is running for successful API integration. The backend API is available at:
- HTTPS: `https://localhost:7120`
- HTTP: `http://localhost:5017`

---

Proceed with creating the required pages, components, and context structure as outlined above. Let me know if further adjustments are needed. 🚀
