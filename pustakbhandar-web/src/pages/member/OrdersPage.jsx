import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const sortOptions = [
  { value: 'date_desc', label: 'Date: Newest' },
  { value: 'date_asc', label: 'Date: Oldest' },
  { value: 'amount_desc', label: 'Amount: High to Low' },
  { value: 'amount_asc', label: 'Amount: Low to High' },
  { value: 'status', label: 'Status' },
];

const OrdersPage = () => {
  const { getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/orders`, { headers });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data.data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else {
          setOrders([]);
          setError('No orders found.');
        }
      } else {
        setOrders([]);
        setError('Failed to load orders.');
      }
    } catch (err) {
      setOrders([]);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting logic
  const filteredOrders = orders
    .filter(order => {
      // Search by order ID or claim code
      const searchLower = search.trim().toLowerCase();
      if (searchLower && !(
        order.id.toLowerCase().includes(searchLower) ||
        (order.claimCode && order.claimCode.toLowerCase().includes(searchLower))
      )) return false;
      // Filter by status
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date_asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Add date formatting and total calculation helpers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const calculateTotal = (totalAmount, discount) => {
    return (totalAmount - (discount || 0)).toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#232946] mb-1">My Orders</h1>
          <p className="text-sm text-[#6B7280]">Track your orders, claim codes, and order history.</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <input
          type="text"
          placeholder="Search by order ID or claim code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8EFC] border-[#E5E7EB] bg-white text-[#232946]"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8EFC] border-[#E5E7EB] bg-white text-[#232946]"
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3F8EFC] border-[#E5E7EB] bg-white text-[#232946]"
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          className="bg-[#E5E7EB] text-[#232946] px-4 py-2 rounded-lg hover:bg-[#3F8EFC] hover:text-white transition flex items-center gap-2"
          onClick={fetchOrders}
        >
          <MagnifyingGlassIcon className="h-5 w-5" /> Refresh
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E5E7EB]">
            <thead className="bg-[#F7F7FB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Claim Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-[#6B7280]">Loading orders...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="py-8 text-center text-red-500">{error}</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-[#3F8EFC] font-semibold">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-[#F7F7FB]">
                      <td className="px-6 py-4 whitespace-nowrap text-[#232946] font-semibold">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#6B7280]">{formatDate(order.orderDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#232946] font-semibold">${calculateTotal(order.totalAmount, order.discountApplied)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#3F8EFC] font-semibold">
                        {order.status === 'Completed' && order.claimCode ? order.claimCode : <span className="text-[#6B7280]">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className={`text-[#3F8EFC] hover:text-[#232946] transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}
                          aria-label={expandedOrderId === order.id ? 'Hide details' : 'Show details'}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-[#F7F7FB]">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-[#232946]">Order Information</h4>
                                <dl className="mt-2 space-y-1">
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-[#6B7280]">Order ID:</dt>
                                    <dd className="text-sm text-[#232946]">{order.id}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-[#6B7280]">Order Date:</dt>
                                    <dd className="text-sm text-[#232946]">{formatDate(order.orderDate)}</dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-[#6B7280]">Status:</dt>
                                    <dd className="text-sm text-[#232946]">{order.status}</dd>
                                  </div>
                                  {order.status === 'Completed' && order.claimCode && (
                                    <div className="flex justify-between">
                                      <dt className="text-sm text-[#3F8EFC] font-semibold">Claim Code:</dt>
                                      <dd className="text-sm text-[#3F8EFC] font-bold text-lg">{order.claimCode}</dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-[#232946] mb-3">Order Items</h4>
                                <dl className="mt-2 space-y-3">
                                  {order.items.map((item, idx) => (
                                    <div key={item.bookId || idx} className="flex flex-col border-b border-[#E5E7EB] pb-3">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <span className="text-sm font-medium text-[#232946]">{item.bookTitle}</span>
                                          <span className="text-xs text-[#6B7280] ml-2">({item.format})</span>
                                        </div>
                                        <div className="text-right">
                                          <span className="text-sm text-[#6B7280]">${item.price.toFixed(2)} × {item.quantity}</span>
                                          <span className="text-sm font-medium text-[#3F8EFC] ml-2">${item.subtotal.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </dl>
                              </div>
                            </div>
                            <div className="flex flex-col md:flex-row md:justify-end gap-2 md:gap-8 mt-4 pt-4 border-t border-[#E5E7EB]">
                              <div className="text-sm font-medium text-[#232946]">Subtotal: <span className="font-bold">${order.totalAmount.toFixed(2)}</span></div>
                              {order.discountApplied > 0 && (
                                <div className="text-sm font-medium text-[#3F8EFC]">Discount: -${order.discountApplied.toFixed(2)}</div>
                              )}
                              <div className="text-sm font-medium text-[#232946]">Total: <span className="font-bold">${calculateTotal(order.totalAmount, order.discountApplied)}</span></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage; 