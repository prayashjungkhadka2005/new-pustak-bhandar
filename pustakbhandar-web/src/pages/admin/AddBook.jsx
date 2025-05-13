import React, { useState, useEffect } from 'react';
import ModalPortal from '../../components/ModalPortal';
import { PencilSquareIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { showSuccess, showError } from '../../utils/toast';

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
  const [expandedBookId, setExpandedBookId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

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

  // Handle delete
  const handleDelete = (book) => {
    setBookToDelete(book);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books/${bookToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && (data.status === 200 || data.status === 'success')) {
        setBooks((prev) => prev.filter((b) => b.id !== bookToDelete.id));
        showSuccess('Book deleted successfully!');
      } else {
        showError(data.message || 'Failed to delete book.');
      }
    } catch (err) {
      showError('Failed to delete book.');
    } finally {
      setDeleteModalOpen(false);
      setBookToDelete(null);
    }
  };

  // Handle edit
  const handleEdit = (book) => {
    setEditMode(true);
    setSelectedBook(book);
    setForm({
      title: book.title,
      isbn: book.isbn,
      authorName: book.authorName,
      genreName: book.genreName,
      publisherName: book.publisherName,
      format: book.format,
      price: book.price,
      publicationDate: book.publicationDate ? book.publicationDate.split('T')[0] : '',
      quantity: book.quantity,
      onSale: book.onSale,
      discountId: book.discountId || '',
      coverImage: null,
    });
    setModalOpen(true);
  };

  // Update handleSubmit for edit mode
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

      const validDiscountIds = discounts.map(d => d.id);
      let discountIdToSend = '';
      if (form.discountId && validDiscountIds.includes(form.discountId)) {
        discountIdToSend = form.discountId;
      }
      formData.append('discountId', discountIdToSend);

      if (form.coverImage) formData.append('coverImage', form.coverImage);

      const token = localStorage.getItem('userSession') ? JSON.parse(localStorage.getItem('userSession')).token : '';
      let res, data;
      if (editMode && selectedBook) {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books/${selectedBook.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
      } else {
        res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/books`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        data = await res.json();
      }
      if (res.ok && (data.status === 'success' || data.status === 201 || data.status === 200)) {
        setForm(initialState);
        setModalOpen(false);
        setEditMode(false);
        setSelectedBook(null);
        fetchBooks();
        showSuccess(editMode ? 'Book updated successfully!' : 'Book added successfully!');
      } else {
        showError(data.message || (editMode ? 'Failed to update book.' : 'Failed to add book.'));
      }
    } catch (err) {
      showError(editMode ? 'Failed to update book.' : 'Failed to add book.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset modal state on close
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setSelectedBook(null);
    setForm(initialState);
    setErrors({});
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
      <div className="bg-white rounded-xl shadow p-4">
        <div className="overflow-y-auto max-h-[65vh] rounded-xl">
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
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">On Sale</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">More</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {books.map((book, idx) => (
                  <React.Fragment key={book.id}>
                    <tr
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
                            className="w-12 h-16 object-cover rounded shadow border border-gray-200 bg-gray-100"
                          />
                        ) : (
                          <span className="inline-block w-12 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded border border-gray-200 text-xs">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {book.title}
                        {book.discountId && (
                          <span className="inline-flex items-center gap-2 ml-2 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Discount{book.discountPercentage ? `: ${book.discountPercentage}%` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.authorName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">${book.price}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{book.onSale ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 rounded transition" onClick={() => handleEdit(book)}>
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800 rounded transition" onClick={() => handleDelete(book)}>
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition"
                          onClick={() => setExpandedBookId(expandedBookId === book.id ? null : book.id)}
                          aria-label={expandedBookId === book.id ? 'Hide details' : 'View more'}
                        >
                          {expandedBookId === book.id ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedBookId === book.id && (
                      <tr key={book.id + '-expanded'} className="bg-blue-50">
                        <td colSpan={7} className="px-6 py-6">
                          <div className="flex flex-col md:flex-row gap-8 items-start bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                            <img
                              src={book.coverImageUrl ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')}${book.coverImageUrl}` : ''}
                              alt={book.title}
                              className="w-40 h-56 object-cover rounded-lg shadow border border-gray-200 bg-gray-100 mb-4 md:mb-0"
                            />
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-sm">
                              <div className="col-span-2 mb-2">
                                <span className="text-2xl font-bold text-blue-700">{book.title}</span>
                              </div>
                              <div><span className="font-semibold text-gray-700">ISBN:</span> {book.isbn}</div>
                              <div><span className="font-semibold text-gray-700">Author:</span> {book.authorName}</div>
                              <div><span className="font-semibold text-gray-700">Genre:</span> {book.genreName}</div>
                              <div><span className="font-semibold text-gray-700">Publisher:</span> {book.publisherName}</div>
                              <div><span className="font-semibold text-gray-700">Format:</span> {book.format}</div>
                              <div><span className="font-semibold text-gray-700">Price:</span> <span className="text-green-700 font-semibold">${book.price}</span></div>
                              <div><span className="font-semibold text-gray-700">Publication Date:</span> {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : '-'}</div>
                              <div><span className="font-semibold text-gray-700">Quantity:</span> {book.quantity}</div>
                              <div><span className="font-semibold text-gray-700">Rating:</span> {book.rating ?? '-'}</div>
                              <div><span className="font-semibold text-gray-700">On Sale:</span> {book.onSale ? <span className="text-blue-600 font-semibold">Yes</span> : 'No'}</div>
                              <div>
                                <span className="font-semibold text-gray-700">Discount:</span> {book.discountPercentage ? (
                                  <>
                                    <span className="text-orange-600 font-semibold">{book.discountPercentage}%</span>
                                    {(() => {
                                      const discount = discounts.find(d => d.id === book.discountId);
                                      return discount ? <span className="ml-2 text-gray-600">({discount.description || discount.name})</span> : null;
                                    })()}
                                  </>
                                ) : '—'}
                              </div>
                              <div><span className="font-semibold text-gray-700">Created:</span> {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '-'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {modalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-30 p-4">
            <div className="bg-white rounded-xl shadow-lg px-6 py-4 w-full max-w-2xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={closeModal}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editMode ? 'Edit Book' : 'Add New Book'}</h2>
              {errors.api && <div className="mb-3 p-2 rounded bg-red-50 text-red-700 border border-red-200">{errors.api}</div>}
              <form onSubmit={handleSubmit} className="space-y-2">
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
                    {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Book' : 'Add Book')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                onClick={() => setDeleteModalOpen(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Book</h2>
              <p className="mb-6 text-gray-700">Are you sure you want to delete <span className="font-semibold">{bookToDelete?.title}</span>? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                  onClick={confirmDelete}
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

export default AddBook; 