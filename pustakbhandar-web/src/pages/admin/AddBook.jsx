import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';

const formats = ['Paperback', 'Hardcover'];

const initialState = {
  title: '',
  isbn: '',
  authorName: '',
  genreName: '',
  publisherName: '',
  format: '',
  price: '',
  publicationDate: '',
  quantity: '',
  onSale: false,
  discountId: '',
  coverImage: null,
};

const AddBook = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Fetch books and discounts from API
  useEffect(() => {
    fetchBooks();
    fetchDiscounts();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : ''}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setBooks(data.data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setDropdownLoading(true);
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const discountsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/discounts`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const discountsData = await discountsRes.json();
      setDiscounts((discountsData.data || []).filter(d => d.isActive));
    } catch (err) {
      setDiscounts([]);
    } finally {
      setDropdownLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title || form.title.length > 200) newErrors.title = 'Title is required (max 200 chars)';
    if (!form.isbn || form.isbn.length > 20) newErrors.isbn = 'ISBN is required (max 20 chars)';
    if (!form.authorName) newErrors.authorName = 'Author is required';
    if (!form.genreName) newErrors.genreName = 'Genre is required';
    if (!form.publisherName) newErrors.publisherName = 'Publisher is required';
    if (!form.format) newErrors.format = 'Format is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) newErrors.price = 'Price must be a positive number';
    if (!form.publicationDate) newErrors.publicationDate = 'Publication date is required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0) newErrors.quantity = 'Quantity must be 0 or more';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('isbn', form.isbn);
      formData.append('authorName', form.authorName);
      formData.append('genreName', form.genreName);
      formData.append('publisherName', form.publisherName);
      formData.append('format', form.format);
      formData.append('price', form.price);
      formData.append('publicationDate', form.publicationDate);
      formData.append('quantity', form.quantity);
      formData.append('onSale', form.onSale);
      if (form.discountId) formData.append('discountId', form.discountId);
      if (form.coverImage) formData.append('coverImage', form.coverImage);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : ''}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.status === 201)) {
        setForm(initialState);
        setModalOpen(false);
        fetchBooks();
      } else {
        setErrors({ api: data.message || 'Failed to add book.' });
      }
    } catch (err) {
      setErrors({ api: 'Failed to add book.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Title and Add Book Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Book Details</h1>
          <p className="text-sm text-gray-500">Manage your bookstore's catalog below.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Book
        </button>
      </div>

      {/* Book Table Card */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No books found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cover</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Genre</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Publisher</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">On Sale</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {books.map((book, idx) => (
                <tr
                  key={book.id}
                  className={
                    idx % 2 === 0
                      ? 'bg-white hover:bg-blue-50 transition'
                      : 'bg-gray-50 hover:bg-blue-50 transition'
                  }
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {book.coverImageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')}${book.coverImageUrl}`}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded-lg shadow border border-gray-200 bg-gray-100"
                      />
                    ) : (
                      <span className="inline-block w-14 h-20 flex items-center justify-center bg-gray-100 text-gray-400 rounded-lg border border-gray-200 text-xs">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{book.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.authorName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.genreName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.publisherName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.format}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.price}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.onSale ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.discountPercentage ? `${book.discountPercentage}%` : '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Book Modal */}
      {modalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Book</h2>
              {errors.api && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 border border-red-200">{errors.api}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      maxLength={200}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                    <input
                      type="text"
                      name="isbn"
                      value={form.isbn}
                      maxLength={20}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.isbn ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Name *</label>
                    <input
                      type="text"
                      name="authorName"
                      value={form.authorName}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.authorName ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter author name"
                    />
                    {errors.authorName && <p className="text-xs text-red-500 mt-1">{errors.authorName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre Name *</label>
                    <input
                      type="text"
                      name="genreName"
                      value={form.genreName}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.genreName ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter genre name"
                    />
                    {errors.genreName && <p className="text-xs text-red-500 mt-1">{errors.genreName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publisher Name *</label>
                    <input
                      type="text"
                      name="publisherName"
                      value={form.publisherName}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.publisherName ? 'border-red-400' : 'border-gray-300'}`}
                      placeholder="Enter publisher name"
                    />
                    {errors.publisherName && <p className="text-xs text-red-500 mt-1">{errors.publisherName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                    <select
                      name="format"
                      value={form.format}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.format ? 'border-red-400' : 'border-gray-300'}`}
                    >
                      <option value="">Select format</option>
                      {formats.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    {errors.format && <p className="text-xs text-red-500 mt-1">{errors.format}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date *</label>
                    <input
                      type="date"
                      name="publicationDate"
                      value={form.publicationDate}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.publicationDate ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.publicationDate && <p className="text-xs text-red-500 mt-1">{errors.publicationDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity ? 'border-red-400' : 'border-gray-300'}`}
                      min="0"
                    />
                    {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="onSale"
                      checked={form.onSale}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      id="onSale"
                    />
                    <label htmlFor="onSale" className="ml-2 block text-sm font-medium text-gray-700">
                      On Sale
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                    <select
                      name="discountId"
                      value={form.discountId}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      disabled={!form.onSale || dropdownLoading}
                    >
                      <option value="">No Discount</option>
                      {discounts.map((d) => (
                        <option key={d.id} value={d.id}>{d.description || d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  <input
                    type="file"
                    name="coverImage"
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    accept="image/*"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default AddBook; 