import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';
import { showSuccess, showError } from '../../utils/toast';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const initialForm = {
  description: '',
  percentage: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const DiscountPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [discountToDelete, setDiscountToDelete] = useState(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = `${import.meta.env.VITE_API_BASE_URL}/admin/discounts`;
      const params = [];
      if (search) params.push(`name=${encodeURIComponent(search)}`);
      if (filterStatus !== 'all') params.push(`status=${filterStatus}`);
      if (params.length) url += '?' + params.join('&');
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDiscounts(data.data || []);
    } catch (err) {
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.description || form.description.length > 300) newErrors.description = 'Description is required (max 300 chars)';
    if (!form.percentage || isNaN(form.percentage) || Number(form.percentage) <= 0 || Number(form.percentage) > 100) newErrors.percentage = 'Percentage must be 1-100';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) newErrors.endDate = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const url = isEditing 
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/discounts/${form.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/discounts`;
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: form.description,
          percentage: Number(form.percentage),
          startDate: form.startDate,
          endDate: form.endDate,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.status === 201)) {
        setForm(initialForm);
        setModalOpen(false);
        setIsEditing(false);
        fetchDiscounts();
        showSuccess(isEditing ? 'Discount updated successfully!' : 'Discount added successfully!');
      } else {
        showError(data.message || `Failed to ${isEditing ? 'update' : 'add'} discount.`);
      }
    } catch (err) {
      showError(`Failed to ${isEditing ? 'update' : 'add'} discount.`);
    }
  };

  const handleEdit = (discount) => {
    setIsEditing(true);
    setForm({
      id: discount.id,
      description: discount.description || '',
      percentage: discount.percentage,
      startDate: new Date(discount.startDate).toISOString().split('T')[0],
      endDate: new Date(discount.endDate).toISOString().split('T')[0],
      isActive: discount.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!discountToDelete) return;
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/discounts/${discountToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDeleteModalOpen(false);
        setDiscountToDelete(null);
        fetchDiscounts();
        showSuccess('Discount deleted successfully!');
      } else {
        showError(data.message || 'Failed to delete discount.');
      }
    } catch (err) {
      showError('Failed to delete discount.');
    }
  };

  const openDeleteModal = (discount) => {
    setDiscountToDelete(discount);
    setDeleteModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Discounts</h1>
          <p className="text-sm text-gray-500">Manage all discounts and promotions.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setForm(initialForm);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" /> Add Discount
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <input
          type="text"
          placeholder="Search by description..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          onClick={fetchDiscounts}
        >
          Search
        </button>
      </div>

      {/* Discount Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading discounts...</div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No discounts found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {discounts.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{d.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{d.percentage}%</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{d.startDate ? new Date(d.startDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{d.endDate ? new Date(d.endDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {d.isActive ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-gray-400">Inactive</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleEdit(d)}
                      className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 rounded transition"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(d)}
                      className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800 rounded transition"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Discount Modal */}
      {modalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => {
                  setModalOpen(false);
                  setIsEditing(false);
                  setForm(initialForm);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{isEditing ? 'Edit Discount' : 'Add Discount'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    maxLength={300}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
                    rows={2}
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%) *</label>
                  <input
                    type="number"
                    name="percentage"
                    value={form.percentage}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.percentage ? 'border-red-400' : 'border-gray-300'}`}
                    min="1"
                    max="100"
                  />
                  {errors.percentage && <p className="text-xs text-red-500 mt-1">{errors.percentage}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      id="isActive"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    {isEditing ? 'Update Discount' : 'Add Discount'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && discountToDelete && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDiscountToDelete(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Discount</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this discount? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDiscountToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default DiscountPage; 