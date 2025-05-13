import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
const roleOptions = [
  { value: 'member', label: 'Members' },
  { value: 'staff', label: 'Staff' },
];
const sortOptions = [
  { value: 'join_desc', label: 'Join Date: Newest' },
  { value: 'join_asc', label: 'Join Date: Oldest' },
  { value: 'orders_desc', label: 'Orders: High to Low' },
  { value: 'orders_asc', label: 'Orders: Low to High' },
];

const UserManagementPage = () => {
  const [tab, setTab] = useState('member');
  const [members, setMembers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [sortBy, setSortBy] = useState('join_desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [accordion, setAccordion] = useState({
    userInfo: true,
    orderHistory: false,
    ordersProcessed: false,
    discounts: false,
  });
  const fetchedOrdersRef = useRef(false);
  const [expandedUserId, setExpandedUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [tab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = tab === 'member'
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/members`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/staff`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && (data.status === 200 || data.status === 'success')) {
        if (tab === 'member') setMembers(data.data || []);
        else setStaff(data.data || []);
      } else {
        if (tab === 'member') setMembers([]);
        else setStaff([]);
      }
    } catch (err) {
      if (tab === 'member') setMembers([]);
      else setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering, searching, and sorting logic
  const users = tab === 'member' ? members : staff;
  const filteredUsers = users
    .filter(user => {
      const searchLower = search.trim().toLowerCase();
      if (searchLower && !(
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )) return false;
      if (filterStatus !== 'all') {
        const isActive = user.isActive || user.status === 'Active';
        if (filterStatus === 'active' && !isActive) return false;
        if (filterStatus === 'inactive' && isActive) return false;
      }
      if (filterDateStart && new Date(user.joinDate) < new Date(filterDateStart)) return false;
      if (filterDateEnd && new Date(user.joinDate) > new Date(filterDateEnd)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'join_desc') return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === 'join_asc') return new Date(a.joinDate) - new Date(b.joinDate);
      if (sortBy === 'orders_desc') return (b.totalOrders || b.ordersProcessed || 0) - (a.totalOrders || a.ordersProcessed || 0);
      if (sortBy === 'orders_asc') return (a.totalOrders || a.ordersProcessed || 0) - (b.totalOrders || b.ordersProcessed || 0);
      return 0;
    });

  // Fetch all orders only when needed (for details modal)
  const fetchOrders = async () => {
    if (fetchedOrdersRef.current) return;
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = `${import.meta.env.VITE_API_BASE_URL}/admin/orders`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && (data.status === 200 || data.status === 'success')) {
        setOrders(data.data || []);
        fetchedOrdersRef.current = true;
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">User Management</h1>
          <p className="text-sm text-gray-500">View and monitor members and staff.</p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${tab === 'member' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('member')}
          >
            Members
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${tab === 'staff' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTab('staff')}
          >
            Staff
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDateStart}
          onChange={e => setFilterDateStart(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <input
          type="date"
          value={filterDateEnd}
          onChange={e => setFilterDateEnd(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          onClick={fetchUsers}
        >
          <MagnifyingGlassIcon className="h-5 w-5" /> Search
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{tab === 'member' ? 'Total Orders' : 'Orders Processed'}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <React.Fragment key={user.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(user.joinDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tab === 'member' ? user.totalOrders : user.totalOrders || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isActive || user.status === 'Active' ? (
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">Active</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          if (expandedUserId === user.id) {
                            setExpandedUserId(null);
                          } else {
                            setExpandedUserId(user.id);
                            setSelectedUser(user);
                            if (!orders.length) fetchOrders();
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {expandedUserId === user.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                  {expandedUserId === user.id && selectedUser && (
                    <tr>
                      <td colSpan={6} className="bg-gray-50 px-6 py-4">
                        {/* Accordion Sections */}
                        <div className="space-y-4">
                          {/* User Info Section */}
                          <div className="border rounded-lg">
                            <button
                              className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none"
                              onClick={() => setAccordion(a => ({ ...a, userInfo: !a.userInfo }))}
                            >
                              User Info
                              <span>{accordion.userInfo ? '▲' : '▼'}</span>
                            </button>
                            {accordion.userInfo && (
                              <div className="px-4 py-3 space-y-2">
                                <div><span className="font-medium">Name:</span> {selectedUser.fullName}</div>
                                <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                                <div><span className="font-medium">Join Date:</span> {new Date(selectedUser.joinDate).toLocaleDateString()}</div>
                                <div><span className="font-medium">Role:</span> {tab === 'member' ? 'Member' : 'Staff'}</div>
                                <div><span className="font-medium">Status:</span> {selectedUser.isActive || selectedUser.status === 'Active' ? 'Active' : 'Inactive'}</div>
                              </div>
                            )}
                          </div>
                          {/* Order History (Members) */}
                          {tab === 'member' && (
                            <div className="border rounded-lg">
                              <button
                                className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none"
                                onClick={() => {
                                  setAccordion(a => ({ ...a, orderHistory: !a.orderHistory }));
                                  if (!orders.length) fetchOrders();
                                }}
                              >
                                Order History
                                <span>{accordion.orderHistory ? '▲' : '▼'}</span>
                              </button>
                              {accordion.orderHistory && (
                                <div className="px-4 py-3">
                                  {ordersLoading ? (
                                    <div className="text-gray-500">Loading orders...</div>
                                  ) : (
                                    <>
                                      {orders.filter(o => o.memberId === selectedUser.id).length === 0 ? (
                                        <div className="text-gray-500">No orders found.</div>
                                      ) : (
                                        <table className="min-w-full text-sm border">
                                          <thead>
                                            <tr className="bg-gray-100">
                                              <th className="px-2 py-1 text-left">Order ID</th>
                                              <th className="px-2 py-1 text-left">Date</th>
                                              <th className="px-2 py-1 text-left">Amount</th>
                                              <th className="px-2 py-1 text-left">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {orders.filter(o => o.memberId === selectedUser.id).map(order => (
                                              <tr key={order.id} className="border-t">
                                                <td className="px-2 py-1">{order.id}</td>
                                                <td className="px-2 py-1">{new Date(order.orderDate).toLocaleDateString()}</td>
                                                <td className="px-2 py-1">${order.totalAmount.toFixed(2)}</td>
                                                <td className="px-2 py-1">{order.status}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Orders Processed (Staff) */}
                          {tab === 'staff' && (
                            <div className="border rounded-lg">
                              <button
                                className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none"
                                onClick={() => {
                                  setAccordion(a => ({ ...a, ordersProcessed: !a.ordersProcessed }));
                                  if (!orders.length) fetchOrders();
                                }}
                              >
                                Orders Processed
                                <span>{accordion.ordersProcessed ? '▲' : '▼'}</span>
                              </button>
                              {accordion.ordersProcessed && (
                                <div className="px-4 py-3">
                                  {ordersLoading ? (
                                    <div className="text-gray-500">Loading orders...</div>
                                  ) : (
                                    <>
                                      {orders.filter(o => o.processedByStaffId === selectedUser.id).length === 0 ? (
                                        <div className="text-gray-500">No processed orders found.</div>
                                      ) : (
                                        <table className="min-w-full text-sm border">
                                          <thead>
                                            <tr className="bg-gray-100">
                                              <th className="px-2 py-1 text-left">Order ID</th>
                                              <th className="px-2 py-1 text-left">Date</th>
                                              <th className="px-2 py-1 text-left">Amount</th>
                                              <th className="px-2 py-1 text-left">Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {orders.filter(o => o.processedByStaffId === selectedUser.id).map(order => (
                                              <tr key={order.id} className="border-t">
                                                <td className="px-2 py-1">{order.id}</td>
                                                <td className="px-2 py-1">{new Date(order.orderDate).toLocaleDateString()}</td>
                                                <td className="px-2 py-1">${order.totalAmount.toFixed(2)}</td>
                                                <td className="px-2 py-1">{order.status}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Discounts Earned (Members) */}
                          {tab === 'member' && (
                            <div className="border rounded-lg">
                              <button
                                className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-t-lg focus:outline-none"
                                onClick={() => setAccordion(a => ({ ...a, discounts: !a.discounts }))}
                              >
                                Discounts Earned
                                <span>{accordion.discounts ? '▲' : '▼'}</span>
                              </button>
                              {accordion.discounts && (
                                <div className="px-4 py-3 space-y-2">
                                  <div><span className="font-medium">Total Discount Earned:</span> ${selectedUser.discountEarned?.toFixed(2) ?? '0.00'}</div>
                                  <div><span className="font-medium">10% Stackable Discount Eligibility:</span> {selectedUser.totalOrders >= 10 ? <span className="text-green-600 font-semibold">Eligible</span> : <span className="text-red-600 font-semibold">Not Eligible</span>}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage; 