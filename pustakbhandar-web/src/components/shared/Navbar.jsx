import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserCircleIcon,
  ShoppingCartIcon,
  HeartIcon,
  BellIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import toast from 'react-hot-toast';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'Order':
      return '📦';
    case 'Announcement':
      return '📢';
    case 'Discount Alert':
      return '🎉';
    default:
      return '📌';
  }
};

const Navbar = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const bellRef = useRef();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/notifications`, { headers });
        const data = await res.json();
        if (res.ok) {
          const apiNotifications = (data.data || []).map(n => ({
            message: n.Message || n.message,
            timestamp: n.Timestamp || n.timestamp,
            id: n.Id || n.id,
            type: n.Type || n.type || 'Order',
            isRead: n.IsRead || n.isRead || false
          }));
          setNotifications(apiNotifications);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user, getAuthHeaders]);

  useOrderNotifications((notification) => {
    if (user) {
      setNotifications((prev) => {
        const exists = prev.some(
          n => n.message === notification.message && n.timestamp === notification.timestamp
        );
        if (exists) return prev;
        return [{ ...notification, isRead: false }, ...prev];
      });
      toast(notification.message);
    }
  });

  const markAsRead = async (notificationId) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/members/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers
        }
      );
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  const unreadCount = sortedNotifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                PustakBhandar
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/books"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Books
              </Link>
              <Link
                to="/categories"
                className="border-transparent text-gray-500 hover:border-blue-500 hover:text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Categories
              </Link>
            </div>
          </div>

          {/* Right side - Auth buttons or Profile */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Cart Icon */}
                <Link
                  to="/member/cart"
                  className="text-gray-500 hover:text-blue-600"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                </Link>

                {/* Wishlist Icon */}
                <Link
                  to="/member/wishlist"
                  className="text-gray-500 hover:text-blue-600"
                >
                  <HeartIcon className="h-6 w-6" />
                </Link>

                {/* Notifications Icon */}
                <div className="relative">
                  <button
                    ref={bellRef}
                    className="relative focus:outline-none"
                    onClick={() => setNotifDropdownOpen((open) => !open)}
                  >
                    <BellIcon className="h-6 w-6 text-gray-500 hover:text-blue-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-4 border-b font-semibold text-gray-900 flex justify-between items-center">
                        <span>Notifications</span>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <>
                              <span className="text-sm text-gray-500">{unreadCount} unread</span>
                              <button
                                onClick={async () => {
                                  try {
                                    const headers = getAuthHeaders();
                                    const res = await fetch(
                                      `${import.meta.env.VITE_API_BASE_URL}/members/notifications/read-all`,
                                      {
                                        method: 'PUT',
                                        headers
                                      }
                                    );
                                    if (res.ok) {
                                      setNotifications(prev =>
                                        prev.map(n => ({ ...n, isRead: true }))
                                      );
                                    }
                                  } catch (err) {
                                    console.error('Error marking all notifications as read:', err);
                                  }
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                Mark all as read
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <ul className="max-h-96 overflow-y-auto">
                        {sortedNotifications.length === 0 ? (
                          <li className="p-4 text-gray-500 text-center">No notifications.</li>
                        ) : (
                          sortedNotifications.map((n, idx) => (
                            <li
                              key={n.id || idx}
                              className={`px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                                !n.isRead ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-xl">{getNotificationIcon(n.type)}</span>
                                <div className="flex-1">
                                  <div className="text-sm text-gray-900">{n.message}</div>
                                  {n.timestamp && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(n.timestamp).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                {!n.isRead && (
                                  <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckCircleIcon className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 focus:outline-none"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-8 w-8" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <Link
                          to="/member/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/member/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 