import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';
import { showSuccess, showError } from '../../utils/toast';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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

const pageSizeOptions = [10, 20, 50];

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = `${import.meta.env.VITE_API_BASE_URL}/admin/orders`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && (data.status === 200 || data.status === 'success')) {
        setAllOrders(data.data || []);
      } else {
        setAllOrders([]);
      }
    } catch (err) {
      setAllOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering and sorting logic
  const filteredOrders = allOrders
    .filter(order => {
      // Search by member name or email
      const searchLower = search.trim().toLowerCase();
      if (searchLower && !(
        order.memberName.toLowerCase().includes(searchLower) ||
        order.memberEmail.toLowerCase().includes(searchLower)
      )) return false;
      // Filter by status
      if (filterStatus !== 'all' && order.status !== filterStatus) return false;
      // Filter by date range
      if (filterDateStart && new Date(order.orderDate) < new Date(filterDateStart)) return false;
      if (filterDateEnd && new Date(order.orderDate) > new Date(filterDateEnd)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.orderDate) - new Date(a.orderDate);
      if (sortBy === 'date_asc') return new Date(a.orderDate) - new Date(b.orderDate);
      if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
      if (sortBy === 'amount_asc') return a.totalAmount - b.totalAmount;
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  // Pagination logic
  const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const orderCount = filteredOrders.length;

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setDetailsModalOpen(false);
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-sm text-gray-500">Monitor and review all member orders.</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <input
          type="text"
          placeholder="Search by member name or email..."
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
        <select
          value={pageSize}
          onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>{size} per page</option>
          ))}
        </select>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
          onClick={() => { setPage(1); fetchAllOrders(); }}
        >
          <MagnifyingGlassIcon className="h-5 w-5" /> Search
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Order #{order.claimCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} items
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.memberName}</div>
                      <div className="text-sm text-gray-500">{order.memberEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${order.totalAmount.toFixed(2)}</div>
                      {order.discountApplied > 0 && (
                        <div className="text-sm text-green-600">
                          -${order.discountApplied.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleOrderDetails(order.id);
                          }}
                          className={`text-indigo-600 hover:text-indigo-900 transition-transform ${expandedOrderId === order.id ? 'rotate-90' : ''}`}
                          aria-label={expandedOrderId === order.id ? 'Hide details' : 'Show details'}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Order Information</h4>
                              <dl className="mt-2 space-y-1">
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Order ID:</dt>
                                  <dd className="text-sm text-gray-900">{order.id}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Claim Code:</dt>
                                  <dd className="text-sm text-gray-900">{order.claimCode}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Order Date:</dt>
                                  <dd className="text-sm text-gray-900">{new Date(order.orderDate).toLocaleDateString()} {order.orderTime && (<span className="ml-2 text-xs text-gray-500">{order.orderTime}</span>)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Processed By:</dt>
                                  <dd className="text-sm text-gray-900">{order.processedByStaffName || 'Not processed'}</dd>
                                </div>
                                {order.discountName && (
                                  <div className="flex justify-between">
                                    <dt className="text-sm text-gray-500">Discount Name:</dt>
                                    <dd className="text-sm text-orange-700 font-semibold">{order.discountName}</dd>
                                  </div>
                                )}
                              </dl>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Member Information</h4>
                              <dl className="mt-2 space-y-1">
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Name:</dt>
                                  <dd className="text-sm text-gray-900">{order.memberName}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-sm text-gray-500">Email:</dt>
                                  <dd className="text-sm text-gray-900">{order.memberEmail}</dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Order Items</h4>
                            <div className="overflow-x-auto">
                              {order.discountName && (
                                <div className="mb-2 text-xs text-orange-700 font-semibold">Discount: {order.discountName}</div>
                              )}
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {order.items.map((item, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{item.bookTitle}</td>
                                      <td className="px-4 py-2 text-sm text-gray-500">{item.format}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">${item.subtotal.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                  <tr>
                                    <td colSpan="4" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                      Total:
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                      ${order.totalAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                  {order.discountApplied > 0 && (
                                    <tr>
                                      <td colSpan="4" className="px-4 py-2 text-sm font-medium text-green-600 text-right">
                                        Discount:
                                      </td>
                                      <td className="px-4 py-2 text-sm font-medium text-green-600">
                                        -${order.discountApplied.toFixed(2)}
                                      </td>
                                    </tr>
                                  )}
                                </tfoot>
                              </table>
                            </div>
                          </div>
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

export default OrderPage; 