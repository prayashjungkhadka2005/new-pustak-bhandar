import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError, showSuccess } from '../utils/toast';
import { StarIcon, HeartIcon, ShoppingCartIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const BookPage = () => {
  const { bookId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]); // For demo, fetch user's wishlist if needed
  const [cart, setCart] = useState([]); // For demo, fetch user's cart if needed
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch book details');
        const data = await res.json();
        setBook(data.data);
      } catch (err) {
        showError('Could not load book details.');
        setBook(null);
      } finally {
        setLoading(false);
      }
    };
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/${bookId}/reviews`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const data = await res.json();
        setReviews(Array.isArray(data.data) ? data.data : []);
      } catch {
        setReviews([]);
      }
    };
    const fetchRelated = async () => {
      try {
        // Related by genre
        if (!book) return;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books?genreId=${book.genreId}&exclude=${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch related books');
        const data = await res.json();
        setRelatedBooks(Array.isArray(data.data) ? data.data : []);
      } catch {
        setRelatedBooks([]);
      }
    };
    fetchBook();
    fetchReviews();
    // fetch wishlist/cart if needed
    // fetchRelated will be called after book is loaded
  }, [bookId]);

  useEffect(() => {
    if (book) {
      (async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books?genreId=${book.genreId}&exclude=${bookId}`);
          if (!res.ok) throw new Error('Failed to fetch related books');
          const data = await res.json();
          setRelatedBooks(Array.isArray(data.data) ? data.data : []);
        } catch {
          setRelatedBooks([]);
        }
      })();
    }
  }, [book]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!discountPercentage) return price;
    return price - (price * (discountPercentage / 100));
  };

  const isInWishlist = wishlist.includes(bookId);
  const isInCart = cart.find((item) => item.bookId === bookId);

  const handleAddToWishlist = async () => {
    // Placeholder logic
    setWishlist((prev) => [...prev, bookId]);
    showSuccess('Added to wishlist!');
  };
  const handleRemoveFromWishlist = async () => {
    setWishlist((prev) => prev.filter((id) => id !== bookId));
    showSuccess('Removed from wishlist!');
  };
  const handleAddToCart = async () => {
    setCart((prev) => [...prev, { bookId, quantity: 1 }]);
    showSuccess('Added to cart!');
  };
  const handleUpdateCart = async () => {
    showSuccess('Cart updated!');
  };
  const handleWriteReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    // Placeholder: just add to local reviews
    setReviews((prev) => [
      {
        id: `review-${Date.now()}`,
        user: user?.name || 'You',
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);
    setReviewModalOpen(false);
    setReviewForm({ rating: 0, comment: '' });
    setSubmittingReview(false);
    showSuccess('Review submitted!');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }
  if (!book) {
    return <div className="max-w-2xl mx-auto py-24 text-center text-gray-500">Book not found.</div>;
  }

  // Average rating
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : null;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6 md:p-10">
        <button className="mb-4 flex items-center text-blue-600 hover:underline" onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Book Cover */}
          <div className="flex-shrink-0 w-full md:w-64 aspect-w-3 aspect-h-4 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
            <img
              src={book.coverImageUrl ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${book.coverImageUrl}` : '/images/default-book-cover.jpg'}
              alt={book.title}
              className="object-cover w-full h-full"
              onError={e => { e.target.onerror = null; e.target.src = '/images/default-book-cover.jpg'; }}
            />
          </div>
          {/* Book Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                {book.onSale && book.discountPercentage && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm font-medium">
                    SALE {book.discountPercentage}% OFF
                  </span>
                )}
                {!book.onSale && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                    NOT ON SALE
                  </span>
                )}
              </div>
              <p className="mt-2 text-lg text-gray-700">by {book.authorName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{book.genreName}</span>
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{book.format}</span>
                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">{book.publisherName}</span>
                {book.quantity <= 0 && (
                  <span className="inline-block bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">Out of Stock</span>
                )}
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <div>ISBN: {book.isbn}</div>
                <div>Publication Date: {formatDate(book.publicationDate)}</div>
                <div>Available Quantity: {book.quantity}</div>
              </div>
              <div className="mt-4 text-gray-700">
                <p>{book.description}</p>
              </div>
            </div>
            {/* Pricing & Actions */}
            <div className="mt-6 flex flex-col gap-4">
              {/* Pricing */}
              <div className="flex items-center gap-4">
                {book.onSale && book.discountPercentage ? (
                  <>
                    <span className="text-lg text-gray-400 line-through">{formatCurrency(book.price)}</span>
                    <span className="text-2xl font-bold text-blue-700">
                      {formatCurrency(calculateDiscountedPrice(book.price, book.discountPercentage))}
                    </span>
                    <span className="text-sm text-red-600 font-semibold">{book.discountPercentage}% OFF</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-blue-700">{formatCurrency(book.price)}</span>
                )}
              </div>
              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap">
                {!book.onSale ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed flex items-center gap-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" /> Not Available for Purchase
                  </button>
                ) : !user ? (
                  <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2">
                    <ShoppingCartIcon className="h-5 w-5" /> Login to Purchase
                  </Link>
                ) : book.quantity <= 0 ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed flex items-center gap-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" /> Out of Stock
                  </button>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                      onClick={isInCart ? handleUpdateCart : handleAddToCart}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      {isInCart ? 'Update Quantity' : 'Add to Cart'}
                    </button>
                    {isInWishlist ? (
                      <button
                        className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-2"
                        onClick={handleRemoveFromWishlist}
                      >
                        <HeartIcon className="h-5 w-5" /> Remove from Wishlist
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
                        onClick={handleAddToWishlist}
                      >
                        <HeartIcon className="h-5 w-5" /> Add to Wishlist
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Reviews Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
            {user && (
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={() => setReviewModalOpen(true)}
              >
                <PencilIcon className="h-5 w-5" /> Write a Review
              </button>
            )}
          </div>
          {avgRating && (
            <div className="flex items-center gap-2 mb-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />
              ))}
              <span className="text-gray-700 font-medium">{avgRating}/5</span>
              <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
            </div>
          )}
          {reviews.length > 0 ? (
            <div className="space-y-6 mt-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < review.rating ? 'currentColor' : 'none'} />
                    ))}
                    <span className="text-gray-700 font-medium ml-2">{review.memberName}</span>
                    <span className="text-gray-400 text-xs ml-2">{formatDate(review.reviewDate)}</span>
                  </div>
                  <div className="text-gray-600 mt-2">{review.comment}</div>
                  <div className="mt-2 text-xs text-gray-400">
                    Review for: {review.bookTitle}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 mt-4">No reviews yet.</div>
          )}
        </div>
        {/* Related Books Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Books</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks
              .filter(relatedBook => relatedBook.id !== book.id)
              .slice(0, 4)
              .map(relatedBook => (
                <Link
                  key={relatedBook.id}
                  to={`/books/${relatedBook.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative">
                    <div className="aspect-w-3 aspect-h-4 w-full">
                      <img
                        src={relatedBook.coverImageUrl ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${relatedBook.coverImageUrl}` : '/images/default-book-cover.jpg'}
                        alt={relatedBook.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/default-book-cover.jpg';
                        }}
                      />
                    </div>
                    {relatedBook.onSale && relatedBook.discountPercentage && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          SALE {relatedBook.discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                    {!relatedBook.onSale && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          NOT ON SALE
                        </span>
                      </div>
                    )}
                    {relatedBook.quantity <= 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{relatedBook.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{relatedBook.authorName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {relatedBook.onSale && relatedBook.discountPercentage ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(relatedBook.price)}
                            </span>
                            <span className="text-lg font-semibold text-blue-600">
                              {formatCurrency(calculateDiscountedPrice(relatedBook.price, relatedBook.discountPercentage))}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-blue-600">
                            {formatCurrency(relatedBook.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {relatedBook.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            <span className="text-sm text-gray-600">{relatedBook.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {relatedBook.onSale && relatedBook.discountPercentage && (
                          <span className="text-xs text-red-600 font-medium">
                            {relatedBook.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative"
            onSubmit={handleWriteReview}
          >
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setReviewModalOpen(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Write a Review</h3>
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                >
                  <StarIcon className={`h-6 w-6 ${reviewForm.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} fill={reviewForm.rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows={4}
              placeholder="Write your review..."
              value={reviewForm.comment}
              onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={submittingReview || reviewForm.rating === 0}
            >
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookPage; 