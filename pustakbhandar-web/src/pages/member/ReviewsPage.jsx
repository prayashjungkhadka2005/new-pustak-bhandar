import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const StarRating = ({ value }) => (
  <span className="text-yellow-400">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i}>{i <= value ? '★' : '☆'}</span>
    ))}
  </span>
);

const ReviewsPage = () => {
  const { getAuthHeaders } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ bookId: '', rating: 0, comment: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchPurchasedBooks();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/reviews`, { headers });
      const data = await res.json();
      if (res.ok) {
        setReviews(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (err) {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedBooks = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/orders`, { headers });
      const data = await res.json();
      if (res.ok) {
        const orders = Array.isArray(data) ? data : (data.data || []);
        // Flatten all books from all orders
        const purchased = [];
        orders.forEach(order => {
          (order.items || []).forEach(item => {
            purchased.push({ bookId: item.bookId, bookTitle: item.bookTitle });
          });
        });
        // Remove duplicates
        const uniqueBooks = Array.from(new Map(purchased.map(b => [b.bookId, b])).values());
        setBooks(uniqueBooks);
      }
    } catch (err) {
      setBooks([]);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStarClick = (rating) => {
    setForm({ ...form, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bookId || form.rating < 1 || form.rating > 5) {
      toast.error('Please select a book and rating.');
      return;
    }
    if (form.comment.length > 300) {
      toast.error('Comment must be 300 characters or less.');
      return;
    }
    setFormLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/reviews`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: form.bookId,
          rating: form.rating,
          comment: form.comment,
        }),
      });
      if (res.ok) {
        toast.success('Review submitted!');
        setForm({ bookId: '', rating: 0, comment: '' });
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to submit review.');
      }
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Add Review Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-[#232946] mb-4">Submit a Review</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Book</label>
            <select
              name="bookId"
              value={form.bookId}
              onChange={handleFormChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              required
            >
              <option value="">Select a book</option>
              {books.map((b) => (
                <option key={b.bookId} value={b.bookId}>{b.bookTitle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  className={`text-2xl ${form.rating >= i ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => handleStarClick(i)}
                  aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Comment</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleFormChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              maxLength={300}
              rows={2}
              placeholder="(Optional)"
            />
            <div className="text-xs text-gray-400 text-right">{form.comment.length}/300</div>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-[#3F8EFC] text-white px-4 py-2 rounded-lg hover:bg-[#2D7AE0] transition"
          disabled={formLoading}
        >
          {formLoading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Review List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-[#232946] mb-4">My Reviews</h2>
        {loading ? (
          <div className="text-[#6B7280]">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-[#6B7280]">No reviews submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F7F7FB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Review Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F7F7FB]">
                    <td className="px-6 py-4 whitespace-nowrap text-[#232946] font-medium">{r.bookTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StarRating value={r.rating} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#6B7280]">{r.comment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#6B7280]">{formatDate(r.reviewDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage; 