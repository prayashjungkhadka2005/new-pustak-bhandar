import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';
import { showSuccess, showError } from '../../utils/toast';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const initialForm = {
  title: '',
  message: '',
  type: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let url = `${import.meta.env.VITE_API_BASE_URL}/admin/announcements`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setAnnouncements(data.data || []);
    } catch (err) {
      setAnnouncements([]);
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
    if (!form.title || form.title.length > 200) newErrors.title = 'Title is required (max 200 chars)';
    if (!form.message) newErrors.message = 'Message is required';
    if (!form.type || form.type.length > 50) newErrors.type = 'Type is required (max 50 chars)';
    if (!form.startDate) newErrors.startDate = 'Start date is required';
    if (!form.endDate) newErrors.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.startDate) >= new Date(form.endDate)) newErrors.endDate = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        startDate: form.startDate,
        endDate: form.endDate,
        isActive: form.isActive,
      };
      let res, data;
      if (isEditing && form.id) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/announcements/${form.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/announcements`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await res.json();
      }
      if (res.ok && (data.status === 'success' || data.status === 201)) {
        setForm(initialForm);
        setModalOpen(false);
        setIsEditing(false);
        fetchAnnouncements();
        showSuccess(isEditing ? 'Announcement updated successfully!' : 'Announcement added successfully!');
      } else {
        showError(data.message || `Failed to ${isEditing ? 'update' : 'add'} announcement.`);
      }
    } catch (err) {
      showError(`Failed to ${isEditing ? 'update' : 'add'} announcement.`);
    }
  };

  const handleEdit = (announcement) => {
    setIsEditing(true);
    setForm({
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      isActive: announcement.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!announcementToDelete) return;
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/announcements/${announcementToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDeleteModalOpen(false);
        setAnnouncementToDelete(null);
        fetchAnnouncements();
        showSuccess('Announcement deleted successfully!');
      } else {
        showError(data.message || 'Failed to delete announcement.');
      }
    } catch (err) {
      showError('Failed to delete announcement.');
    }
  };

  // Filtered and searched announcements
  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = search.trim() === '' || a.title.toLowerCase().includes(search.toLowerCase()) || a.message.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? a.isActive : !a.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Announcements</h1>
          <p className="text-sm text-gray-500">Manage all announcements and notifications.</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setForm(initialForm);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" /> Add Announcement
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <input
          type="text"
          placeholder="Search by title or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          <option value="all">All Types</option>
          <option value="Deal">Deal</option>
          <option value="NewArrival">New Arrival</option>
          <option value="Info">Info</option>
          <option value="Promotion">Promotion</option>
        </select>
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
          onClick={fetchAnnouncements}
        >
          Search
        </button>
      </div>

      {/* Announcement Table */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading announcements...</div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No announcements found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">End Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAnnouncements.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{a.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={a.message}>{a.message.length > 100 ? a.message.slice(0, 100) + '…' : a.message}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{a.type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{a.startDate ? new Date(a.startDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{a.endDate ? new Date(a.endDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {a.isActive ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-gray-400">Inactive</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <button 
                      onClick={() => handleEdit(a)}
                      className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 rounded transition"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => { setAnnouncementToDelete(a); setDeleteModalOpen(true); }}
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

      {/* Add/Edit Announcement Modal */}
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">{isEditing ? 'Edit Announcement' : 'Add Announcement'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={200}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    maxLength={1000}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
                    rows={3}
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-400' : 'border-gray-300'}`}
                  >
                    <option value="">Select type</option>
                    <option value="Deal">Deal</option>
                    <option value="NewArrival">New Arrival</option>
                    <option value="Info">Info</option>
                    <option value="Promotion">Promotion</option>
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
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
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    id="isActive"
                  />
                  <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                  >
                    {isEditing ? 'Update Announcement' : 'Add Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && announcementToDelete && (
        <ModalPortal>
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAnnouncementToDelete(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Announcement</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-semibold">{announcementToDelete?.title}</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  onClick={() => { setDeleteModalOpen(false); setAnnouncementToDelete(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  onClick={handleDelete}
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

export default AnnouncementPage; 