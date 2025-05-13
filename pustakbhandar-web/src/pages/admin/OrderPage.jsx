import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';
import { showSuccess, showError } from '../../utils/toast';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';

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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [search, filterStatus, filterDateStart, filterDateEnd, sortBy, page, pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = `${import.meta.env.VITE_API_BASE_URL}/admin/orders?`;
      const params = [];
      if (search.trim()) params.push(`member=${encodeURIComponent(search.trim())}`);
      if (filterStatus !== 'all') params.push(`status=${filterStatus}`);
      if (filterDateStart) params.push(`startDate=${filterDateStart}`);
      if (filterDateEnd) params.push(`endDate=${filterDateEnd}`);
      // Sorting
      if (sortBy.startsWith('date')) params.push(`sortBy=date&order=${sortBy.endsWith('desc') ? 'desc' : 'asc'}`);
      else if (sortBy.startsWith('amount')) params.push(`sortBy=amount&order=${sortBy.endsWith('desc') ? 'desc' : 'asc'}`);
      else if (sortBy === 'status') params.push(`sortBy=status&order=asc`);
      // Pagination
      params.push(`page=${page}`);
      params.push(`pageSize=${pageSize}`);
      url += params.join('&');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && (data.status === 200 || data.status === 'success')) {
        setOrders(data.data || []);
        // If backend returns total count, set totalPages accordingly
        if (data.totalCount) setTotalPages(Math.ceil(data.totalCount / pageSize));
        else setTotalPages(orders.length < pageSize ? page : page + 1); // fallback
        setOrderCount(data.totalCount || (data.data ? data.data.length : 0));
      } else {
        setOrders([]);
        setOrderCount(0);
      }
    } catch (err) {
      setOrders([]);
      setOrderCount(0);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => { setPage(1); fetchOrders(); }}
        >
          <MagnifyingGlassIcon className="h-5 w-5" /> Search
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No orders found.</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Member Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount Applied</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{order.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.memberName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${order.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.discountApplied ? `${order.discountApplied}%` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {order.status === 'Pending' && <span className="text-yellow-600 font-semibold">Pending</span>}
                      {order.status === 'Completed' && <span className="text-green-600 font-semibold">Completed</span>}
                      {order.status === 'Cancelled' && <span className="text-red-600 font-semibold">Cancelled</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 rounded transition"
                        onClick={() => openOrderDetails(order)}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing page {page} of {totalPages} ({orderCount} orders)
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {detailsModalOpen && selectedOrder && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={closeOrderDetails}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold text-gray-700">Order ID:</span> {selectedOrder.id}</div>
                <div><span className="font-semibold text-gray-700">Member Name:</span> {selectedOrder.memberName}</div>
                <div><span className="font-semibold text-gray-700">Member Email:</span> {selectedOrder.memberEmail}</div>
                <div><span className="font-semibold text-gray-700">Order Date:</span> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : '-'}</div>
                <div><span className="font-semibold text-gray-700">Claim Code:</span> {selectedOrder.claimCode || '—'}</div>
                <div><span className="font-semibold text-gray-700">Status:</span> {selectedOrder.status}</div>
                <div><span className="font-semibold text-gray-700">Total Amount:</span> ${selectedOrder.totalAmount?.toFixed(2)}</div>
                <div><span className="font-semibold text-gray-700">Discount Applied:</span> {selectedOrder.discountApplied ? `${selectedOrder.discountApplied}%` : '—'}</div>
                <div className="font-semibold text-gray-700 mt-2">Order Items:</div>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg mb-2">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Book Title</th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Format</th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900">{item.bookTitle}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{item.format}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">${item.price?.toFixed(2)}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700">${item.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="text-center text-gray-500 py-2">No items</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default OrderPage; 