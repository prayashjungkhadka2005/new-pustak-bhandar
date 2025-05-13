import React, { useEffect, useState } from 'react';
import {
  BookOpenIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  MegaphoneIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

// Dummy data
const stats = [
  { name: 'Total Books', value: '1,234', icon: BookOpenIcon, color: 'bg-blue-500' },
  { name: 'Total Members', value: '456', icon: UserGroupIcon, color: 'bg-green-500' },
  { name: 'Pending Orders', value: '23', icon: ShoppingCartIcon, color: 'bg-yellow-500' },
  { name: 'Total Revenue', value: '$12,345', icon: CurrencyDollarIcon, color: 'bg-indigo-500' },
];

const quickActions = [
  { name: 'Add Book', icon: PlusIcon, color: 'bg-blue-500', href: '/admin/books/add' },
  { name: 'Create Discount', icon: TagIcon, color: 'bg-pink-500', href: '/admin/discounts' },
  { name: 'Send Announcement', icon: MegaphoneIcon, color: 'bg-yellow-500', href: '/admin/announcements' },
  { name: 'View Orders', icon: ShoppingCartIcon, color: 'bg-indigo-500', href: '/admin/orders' },
];

const recentOrders = [
  { id: 1, member: 'John Doe', amount: '$45.99', status: 'Pending', date: '2024-03-15' },
  { id: 2, member: 'Jane Smith', amount: '$89.99', status: 'Completed', date: '2024-03-14' },
];

const recentMembers = [
  { id: 1, name: 'Alice Brown', email: 'alice@example.com', joined: '2024-03-15' },
  { id: 2, name: 'David Lee', email: 'david@example.com', joined: '2024-03-14' },
];

const recentAnnouncements = [
  { id: 1, title: 'Spring Sale!', date: '2024-03-15' },
  { id: 2, title: 'New Arrivals: March', date: '2024-03-14' },
];

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Books', value: '—', icon: BookOpenIcon, color: 'bg-blue-500' },
    { name: 'Total Members', value: '—', icon: UserGroupIcon, color: 'bg-green-500' },
    { name: 'Pending Orders', value: '—', icon: ShoppingCartIcon, color: 'bg-yellow-500' },
    { name: 'Total Revenue', value: '—', icon: CurrencyDollarIcon, color: 'bg-indigo-500' },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
        const headers = { Authorization: `Bearer ${token}` };
        // Fetch all in parallel
        const [booksRes, membersRes, ordersRes, announcementsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/members`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/orders`, { headers }),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/announcements`, { headers }),
        ]);
        const [booksData, membersData, ordersData, announcementsData] = await Promise.all([
          booksRes.json(),
          membersRes.json(),
          ordersRes.json(),
          announcementsRes.json(),
        ]);
        // Stats
        const totalBooks = booksData.data ? booksData.data.length : 0;
        const totalMembers = membersData.data ? membersData.data.length : 0;
        const pendingOrders = ordersData.data ? ordersData.data.filter(o => o.status === 'Pending').length : 0;
        const totalRevenue = ordersData.data
          ? ordersData.data.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0)
          : 0;
        setStats([
          { name: 'Total Books', value: totalBooks, icon: BookOpenIcon, color: 'bg-blue-500' },
          { name: 'Total Members', value: totalMembers, icon: UserGroupIcon, color: 'bg-green-500' },
          { name: 'Pending Orders', value: pendingOrders, icon: ShoppingCartIcon, color: 'bg-yellow-500' },
          { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: CurrencyDollarIcon, color: 'bg-indigo-500' },
        ]);
        // Recent Orders (last 5)
        setRecentOrders(
          ordersData.data
            ? ordersData.data
                .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
                .slice(0, 5)
                .map(o => ({
                  id: o.id,
                  member: o.memberName,
                  amount: `$${o.totalAmount.toFixed(2)}`,
                  status: o.status,
                  date: new Date(o.orderDate).toLocaleDateString(),
                }))
            : []
        );
        // Recent Members (last 5)
        setRecentMembers(
          membersData.data
            ? membersData.data
                .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
                .slice(0, 5)
                .map(m => ({
                  id: m.id,
                  name: m.fullName,
                  email: m.email,
                  joined: new Date(m.joinDate).toLocaleDateString(),
                }))
            : []
        );
        // Recent Announcements (last 5)
        setRecentAnnouncements(
          announcementsData.data
            ? announcementsData.data
                .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                .slice(0, 5)
                .map(a => ({
                  id: a.id,
                  title: a.title,
                  date: new Date(a.startDate).toLocaleDateString(),
                }))
            : []
        );
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Overview Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
        <p className="text-sm text-gray-500">Quick stats and recent activity for your bookstore.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex items-center space-x-4 bg-white rounded-xl shadow p-4"
          >
            <div className={`p-3 rounded-full ${stat.color} bg-opacity-20`}>
              <stat.icon className={`h-7 w-7 ${stat.color} text-opacity-80`} />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">{stat.name}</div>
              <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg shadow bg-white hover:bg-blue-50 transition"
            >
              <span className={`p-2 rounded-full ${action.color} bg-opacity-20`}>
                <action.icon className={`h-5 w-5 ${action.color} text-opacity-80`} />
              </span>
              <span className="font-medium text-gray-800">{action.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity as Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Orders</h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <li className="py-2 text-gray-400 text-sm">No recent orders.</li>
              ) : (
                recentOrders.map((order) => (
                  <li key={order.id} className="py-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-800">{order.member}</span>
                      <span className="text-gray-500">{order.amount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{order.status}</span>
                      <span>{order.date}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {/* Recent Members Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Members</h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentMembers.length === 0 ? (
                <li className="py-2 text-gray-400 text-sm">No recent members.</li>
              ) : (
                recentMembers.map((member) => (
                  <li key={member.id} className="py-2">
                    <div className="font-medium text-gray-800 text-sm">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                    <div className="text-xs text-gray-400">Joined: {member.joined}</div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
        {/* Announcements Card */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Announcements</h3>
          {loading ? (
            <div className="text-gray-400 text-sm">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {recentAnnouncements.length === 0 ? (
                <li className="py-2 text-gray-400 text-sm">No announcements.</li>
              ) : (
                recentAnnouncements.map((announcement) => (
                  <li key={announcement.id} className="py-2">
                    <div className="font-medium text-gray-800 text-sm">{announcement.title}</div>
                    <div className="text-xs text-gray-400">{announcement.date}</div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 