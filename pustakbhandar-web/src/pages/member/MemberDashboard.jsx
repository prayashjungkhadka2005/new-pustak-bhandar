import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MemberDashboard = () => {
  const { getAuthHeaders } = useAuth();

  // State for each section
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers = getAuthHeaders();
        // Fetch all in parallel
        const [profileRes, ordersRes, cartRes, wishlistRes, notificationsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/members/profile`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/members/orders`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/members/whitelist`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/members/notifications`, { headers }),
        ]);
        const [profileData, ordersData, cartData, wishlistData, notificationsData] = await Promise.all([
          profileRes.json(),
          ordersRes.json(),
          cartRes.json(),
          wishlistRes.json(),
          notificationsRes.json(),
        ]);
        setProfile(profileData.data || profileData);
        setOrders((ordersData.data || ordersData).slice(0, 5)); // Show only 5 recent
        setCart(cartData.data || cartData);
        setWishlist(wishlistData.data || wishlistData);
        setNotifications((notificationsData.data || notificationsData).slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {/* Profile Summary */}
      <div className="bg-white rounded-xl shadow p-6 flex items-center space-x-8 mb-6">
        {loading ? (
          <div className="h-20 w-20 rounded-full bg-[#232946] animate-pulse" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-[#232946] flex items-center justify-center text-3xl font-bold text-white">
            {profile?.fullName?.[0] || '?'}
          </div>
        )}
        <div>
          <div className="text-xl font-bold text-[#232946] mb-1">
            {loading ? <span className="animate-pulse bg-[#E5E7EB] rounded w-24 h-6 inline-block" /> : profile?.fullName}
          </div>
          <div className="text-sm text-[#6B7280] mb-1">
            {loading ? <span className="animate-pulse bg-[#E5E7EB] rounded w-32 h-4 inline-block" /> : profile?.email}
          </div>
          <div className="text-xs text-[#6B7280]">
            {loading ? <span className="animate-pulse bg-[#E5E7EB] rounded w-20 h-3 inline-block" /> : `Joined: ${profile ? new Date(profile.joinDate).toLocaleDateString() : ''}`}
          </div>
        </div>
      </div>
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#232946] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Recent Orders</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-[#E5E7EB] rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 text-xs">{error}</div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {orders.length === 0 ? (
                <li className="py-2 text-[#3F8EFC] text-xs font-semibold">No recent orders.</li>
              ) : (
                orders.map((order) => (
                  <li key={order.id} className="py-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-white">{order.id || order.orderId}</span>
                      <span className="text-[#3F8EFC] font-semibold">${order.total?.toFixed(2) ?? order.totalAmount?.toFixed(2) ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#E5E7EB]">
                      <span>{order.status}</span>
                      <span>{order.date ? order.date : (order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '')}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
          <Link to="/member/orders" className="block mt-2 text-xs text-[#3F8EFC] font-semibold hover:underline">View all orders</Link>
        </div>
        {/* Cart Summary */}
        <div className="bg-[#232946] rounded-xl shadow-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Cart Summary</h3>
            <div className="text-lg font-bold text-white">
              {loading ? <span className="animate-pulse bg-[#E5E7EB] rounded w-16 h-6 inline-block" /> : `$${cart?.totalAmount?.toFixed(2) ?? '0.00'}`}
            </div>
          </div>
          <Link to="/member/cart" className="mt-4 text-xs text-[#3F8EFC] font-semibold hover:underline">Go to Cart</Link>
        </div>
        {/* Wishlist Summary */}
        <div className="bg-[#232946] rounded-xl shadow-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Wishlist</h3>
            <div className="text-lg font-bold text-white">
              {loading ? <span className="animate-pulse bg-[#E5E7EB] rounded w-8 h-6 inline-block" /> : `${wishlist.length} items`}
            </div>
          </div>
          <Link to="/member/wishlist" className="mt-4 text-xs text-[#3F8EFC] font-semibold hover:underline">View Wishlist</Link>
        </div>
        {/* Notifications */}
        <div className="bg-[#232946] rounded-xl shadow-lg p-4">
          <h3 className="text-sm font-semibold text-white mb-2">Notifications</h3>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-5 bg-[#E5E7EB] rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-400 text-xs">{error}</div>
          ) : (
            <ul className="divide-y divide-[#E5E7EB]">
              {notifications.length === 0 ? (
                <li className="py-2 text-[#3F8EFC] text-xs font-semibold">No notifications.</li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id} className="py-2">
                    <div className="text-sm text-white">{n.message || n.title}</div>
                    <div className="text-xs text-[#E5E7EB]">{n.date ? n.date : (n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '')}</div>
                  </li>
                ))
              )}
            </ul>
          )}
          <Link to="/member/notifications" className="block mt-2 text-xs text-[#3F8EFC] font-semibold hover:underline">View all notifications</Link>
        </div>
      </div>
    </>
  );
};

export default MemberDashboard; 