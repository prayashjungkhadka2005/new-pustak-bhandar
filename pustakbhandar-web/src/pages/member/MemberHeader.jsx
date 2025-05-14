import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BellIcon, UserCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import toast from 'react-hot-toast';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

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

const MemberHeader = () => {
  const { user, logout, getAuthHeaders } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const bellRef = useRef();
  const profileRef = useRef();

  // Fetch API notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/notifications`, { headers });
        const data = await res.json();
        if (res.ok) {
          // Normalize API notifications to match real-time format
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
        // Ignore errors for now
      }
    };
    fetchNotifications();
  }, [getAuthHeaders]);

  // Real-time notifications
  useOrderNotifications((notification) => {
    setNotifications((prev) => {
      // Avoid duplicates by id+timestamp+message
      const exists = prev.some(
        n => n.message === notification.message && n.timestamp === notification.timestamp
      );
      if (exists) return prev;
      return [{ ...notification, isRead: false }, ...prev];
    });
    toast(notification.message);
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

  // Sort notifications by timestamp (newest first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tb - ta;
  });

  const unreadCount = sortedNotifications.filter(n => !n.isRead).length;
  const greeting = getGreeting();
  const name = user?.fullName ? user.fullName.split(' ')[0] : '';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Greeting */}
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold text-[#232946]">
              {greeting}{name ? `, ${name}` : ''}!
            </div>
          </div>
          {/* Right: Notification bell and profile */}
          <div className="flex items-center space-x-4">
            {/* Notification bell */}
            <div className="relative">
              <button
                ref={bellRef}
                className="relative focus:outline-none"
                onClick={() => setNotifDropdownOpen((open) => !open)}
              >
                <BellIcon className="h-6 w-6 text-[#232946]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b font-semibold text-[#232946] flex justify-between items-center">
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
                      <li className="p-4 text-[#6B7280] text-center">No notifications.</li>
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
                              <div className="text-sm text-[#232946]">{n.message}</div>
                              {n.timestamp && (
                                <div className="text-xs text-[#6B7280] mt-1">
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
            {/* Profile dropdown */}
            <div className="relative">
              <button
                ref={profileRef}
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setProfileDropdownOpen((open) => !open)}
              >
                <UserCircleIcon className="h-8 w-8 text-[#232946]" />
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MemberHeader; 