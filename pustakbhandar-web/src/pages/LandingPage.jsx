import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showError } from '../utils/toast';
import {
  BookOpenIcon,
  TagIcon,
  StarIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured books
        const booksResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books?filter=featured`);
        if (!booksResponse.ok) {
          throw new Error('Failed to fetch featured books');
        }
        const booksData = await booksResponse.json();
        setFeaturedBooks(Array.isArray(booksData.data) ? booksData.data : []);

        // Fetch categories (genres)
        const categoriesResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/genre`);
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData.data) ? categoriesData.data : []);

        // Fetch reviews
        const reviewsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/reviews`);
        if (!reviewsResponse.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const reviewsData = await reviewsResponse.json();
        setReviews(Array.isArray(reviewsData.data) ? reviewsData.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showError('Failed to load page data. Please try again later.');
        setFeaturedBooks([]);
        setCategories([]);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Welcome to PustakBhandar
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Your one-stop destination for quality books and educational resources.
              Discover, explore, and enjoy books from various genres.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/books"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transition-colors duration-300"
              >
                Browse Books
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-300"
                >
                  Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Books
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Discover our latest additions and special offers
          </p>
        </div>

        {featuredBooks.length > 0 ? (
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {featuredBooks.map((book) => (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="aspect-w-3 aspect-h-4 w-full">
                  <img
                    src={book.coverImageUrl ? `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${book.coverImageUrl}` : '/images/default-book-cover.jpg'}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-book-cover.jpg';
                    }}
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">{book.authorName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-semibold text-blue-600">
                      {formatCurrency(book.price)}
                    </span>
                    {book.discountPercentage > 0 && (
                      <span className="text-sm text-red-600">
                        {book.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 text-center text-gray-500">
            No featured books available at the moment.
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Explore our wide range of book categories
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/books/genre/${category.id}`}
                  className="group relative rounded-lg p-6 bg-gray-50 hover:bg-blue-50 transition-colors duration-300"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white group-hover:bg-blue-700">
                    <BookOpenIcon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-gray-500">
              No categories available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Summer Sale
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Get up to 20% off on bestsellers
            </p>
            <div className="mt-8">
              <Link
                to="/books?sale=true"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50 transition-colors duration-300"
              >
                Shop Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              What Our Readers Say
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Discover why readers love PustakBhandar
            </p>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-gray-600 line-clamp-3">
                    "{review.comment}"
                  </p>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {review.memberName?.charAt(0) || 'R'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {review.memberName || 'Reader'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.bookTitle ? `Review for ${review.bookTitle}` : 'Verified Buyer'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-gray-500">
              No reviews available at the moment.
            </div>
          )}
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              About PustakBhandar
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              PustakBhandar is your trusted destination for quality books and educational resources.
              We are committed to providing a wide selection of books across various genres,
              ensuring that every reader finds their perfect match.
            </p>
          </div>
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <BookOpenIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Wide Selection</h3>
              <p className="mt-2 text-gray-500">
                Browse through thousands of books across various genres
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <ShoppingBagIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Easy Shopping</h3>
              <p className="mt-2 text-gray-500">
                Simple and secure checkout process
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center">
                <UserGroupIcon className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Community</h3>
              <p className="mt-2 text-gray-500">
                Join our community of book lovers
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 