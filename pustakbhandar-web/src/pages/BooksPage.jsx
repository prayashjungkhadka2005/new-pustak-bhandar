import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { showError, showSuccess } from '../utils/toast';
import { StarIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const BooksPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    sort: searchParams.get('sort') || 'newest',
    search: searchParams.get('search') || '',
    sale: searchParams.get('sale') === 'true',
  });
  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState({ items: [] });

  // Debounced search function
  const debouncedSearch = useCallback(
    (value) => {
      const timer = setTimeout(() => {
        handleFilterChange('search', value);
      }, 500);
      return () => clearTimeout(timer);
    },
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Fetch user's wishlist and cart
  const fetchUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch wishlist (whitelist in API)
      const wishlistRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/wishlist`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlist(Array.isArray(wishlistData.data) ? wishlistData.data.map(item => item.bookId) : []);
      }

      // Fetch cart
      const cartRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCart(cartData.data);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      // Reset to empty arrays on error
      setWishlist([]);
      setCart({ items: [] });
    }
  }, [user]);

  // Handle wishlist actions
  const handleWishlistAction = async (bookId) => {
    if (!user) {
      showError('Please login to manage wishlist');
      return;
    }

    try {
      const isInWishlist = Array.isArray(wishlist) && wishlist.includes(bookId);
      
      console.log('Current wishlist state:', wishlist); // Debug log
      console.log('Is in wishlist:', isInWishlist); // Debug log
      console.log('Book ID:', bookId); // Debug log

      const url = `${import.meta.env.VITE_API_BASE_URL}/members/wishlist${isInWishlist ? `/${bookId}` : ''}`;
      const method = isInWishlist ? 'DELETE' : 'POST';

      console.log('Making request to:', url); // Debug log
      console.log('Method:', method); // Debug log

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: !isInWishlist ? JSON.stringify({ bookId }) : undefined
      });

      console.log('Response status:', res.status); // Debug log

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Wishlist API error:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to update wishlist');
      }

      // Refresh wishlist data after successful operation
      const wishlistRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/wishlist`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        console.log('Updated wishlist data:', wishlistData); // Debug log
        setWishlist(Array.isArray(wishlistData.data) ? wishlistData.data.map(item => item.bookId) : []);
        showSuccess(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        throw new Error('Failed to refresh wishlist data');
      }
    } catch (err) {
      console.error('Wishlist operation error:', err); // Debug log
      showError(err.message || 'Could not update wishlist');
    }
  };

  // Fetch user's wishlist
  const fetchWishlist = useCallback(async () => {
    if (!user) return;

    try {
      const wishlistRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/wishlist`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        console.log('Fetched wishlist data:', wishlistData); // Debug log
        setWishlist(Array.isArray(wishlistData.data) ? wishlistData.data.map(item => item.bookId) : []);
      } else {
        console.error('Failed to fetch wishlist:', await wishlistRes.text()); // Debug log
        setWishlist([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err); // Debug log
      setWishlist([]);
    }
  }, [user]);

  // Update useEffect to use fetchWishlist
  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  // Handle cart actions
  const handleCartAction = async (bookId) => {
    if (!user) {
      showError('Please login to add to cart');
      return;
    }

    try {
      const isInCart = Array.isArray(cart?.items) && cart.items.some(item => item.bookId === bookId);
      const cartItem = isInCart ? cart.items.find(item => item.bookId === bookId) : null;
      
      console.log('Current cart state:', cart); // Debug log
      console.log('Is in cart:', isInCart); // Debug log
      console.log('Cart item:', cartItem); // Debug log

      let url, method, body;

      if (isInCart) {
        // Remove from cart
        url = `${import.meta.env.VITE_API_BASE_URL}/members/cart/${cartItem.id}`;
        method = 'DELETE';
      } else {
        // Add to cart
        url = `${import.meta.env.VITE_API_BASE_URL}/members/cart`;
        method = 'POST';
        body = JSON.stringify({ bookId, quantity: 1 });
      }

      console.log('Making request to:', url); // Debug log
      console.log('Method:', method); // Debug log
      console.log('Body:', body); // Debug log

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      console.log('Response status:', res.status); // Debug log

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Cart API error:', errorData); // Debug log
        throw new Error(errorData.message || 'Failed to update cart');
      }

      // Refresh cart data after successful operation
      const cartRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        console.log('Updated cart data:', cartData); // Debug log
        setCart(cartData.data);
        showSuccess(isInCart ? 'Removed from cart' : 'Added to cart');
      } else {
        throw new Error('Failed to refresh cart data');
      }
    } catch (err) {
      console.error('Cart operation error:', err); // Debug log
      showError(err.message || 'Could not update cart');
    }
  };

  // Fetch user's cart
  const fetchCart = useCallback(async () => {
    if (!user) return;

    try {
      const cartRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        console.log('Fetched cart data:', cartData); // Debug log
        setCart(cartData.data);
      } else {
        console.error('Failed to fetch cart:', await cartRes.text()); // Debug log
        setCart({ items: [] });
      }
    } catch (err) {
      console.error('Error fetching cart:', err); // Debug log
      setCart({ items: [] });
    }
  }, [user]);

  // Update useEffect to use fetchCart
  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  // Fetch books with current filters
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_BASE_URL}/books?`;
      
      // Add filters to URL
      if (filters.genre) {
        url += `genreId=${filters.genre}&`;
      }
      if (filters.search) {
        url += `search=${encodeURIComponent(filters.search)}&`;
      }
      if (filters.sale) {
        url += `sale=true&`;
      }

      // Add sorting
      switch (filters.sort) {
        case 'price_asc':
          url += 'sort=price&order=asc';
          break;
        case 'price_desc':
          url += 'sort=price&order=desc';
          break;
        case 'rating':
          url += 'sort=rating&order=desc';
          break;
        case 'newest':
        default:
          url += 'sort=publicationDate&order=desc';
          break;
      }

      console.log('Fetching books with URL:', url); // Debug log

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      
      // Filter books based on sale status if needed
      let filteredBooks = Array.isArray(data.data) ? data.data : [];
      if (filters.sale) {
        filteredBooks = filteredBooks.filter(book => book.onSale && book.discountPercentage > 0);
      }
      
      setBooks(filteredBooks);
    } catch (err) {
      console.error('Error fetching books:', err); // Debug log
      showError('Could not load books.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch genres
  const fetchGenres = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/books/genre`);
      if (!res.ok) throw new Error('Failed to fetch genres');
      const data = await res.json();
      setGenres(Array.isArray(data.data) ? data.data : []);
    } catch {
      setGenres([]);
    }
  };

  // Update filters and URL params
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  // Effect to fetch books when filters change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Effect to fetch genres on mount
  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!discountPercentage) return price;
    return price - (price * (discountPercentage / 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Browse Books
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Discover our collection of books
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search books..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* Genre Filter */}
            <div>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Sort */}
            <div>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            {/* Sale Filter */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                  checked={filters.sale}
                  onChange={(e) => handleFilterChange('sale', e.target.checked)}
                />
                <span>On Sale</span>
              </label>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
                <Link to={`/books/${book.id}`} className="flex-grow">
                  <div className="relative">
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
                    {book.onSale && book.discountPercentage && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          SALE {book.discountPercentage}% OFF
                        </span>
                      </div>
                    )}
                    {!book.onSale && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          NOT ON SALE
                        </span>
                      </div>
                    )}
                    {book.quantity <= 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                          OUT OF STOCK
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-1">{book.authorName}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {book.onSale && book.discountPercentage ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              {formatCurrency(book.price)}
                            </span>
                            <span className="text-lg font-semibold text-blue-600">
                              {formatCurrency(calculateDiscountedPrice(book.price, book.discountPercentage))}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-semibold text-blue-600">
                            {formatCurrency(book.price)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        {book.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            <span className="text-sm text-gray-600">{book.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {book.onSale && book.discountPercentage && (
                          <span className="text-xs text-red-600 font-medium">
                            {book.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                {/* Member Actions */}
                {user && (
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => handleCartAction(book.id)}
                      disabled={!book.onSale || book.quantity <= 0}
                      className={`flex-1 px-3 py-2 rounded flex items-center justify-center gap-2 ${
                        Array.isArray(cart?.items) && cart.items.some(item => item.bookId === book.id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      } ${(!book.onSale || book.quantity <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      {Array.isArray(cart?.items) && cart.items.some(item => item.bookId === book.id) ? 'Remove from Cart' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => handleWishlistAction(book.id)}
                      className={`px-3 py-2 rounded flex items-center justify-center ${
                        Array.isArray(wishlist) && wishlist.includes(book.id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <HeartIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No books found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage; 