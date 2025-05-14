import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [] });

  useEffect(() => {
    fetchWishlist();
    fetchCart();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/wishlist`, { headers });
      const data = await res.json();
      if (res.ok) {
        // Handle both array and object responses
        const items = Array.isArray(data) ? data : (data.data || []);
        setWishlist(items);
      } else {
        setError('Failed to load wishlist.');
        setWishlist([]);
      }
    } catch (err) {
      setError('Failed to load wishlist.');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, { headers });
      const data = await res.json();
      if (res.ok) {
        setCart(data.data || { items: [] });
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setCart({ items: [] });
    }
  };

  const removeFromWishlist = async (bookId) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/wishlist/${bookId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        fetchWishlist(); // Refresh wishlist after removal
      } else {
        setError('Failed to remove item from wishlist.');
      }
    } catch (err) {
      setError('Failed to remove item from wishlist.');
    }
  };

  const addToCart = async (bookId) => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId, quantity: 1 }),
      });
      if (res.ok) {
        fetchCart(); // Refresh cart after adding item
        // Optionally remove from wishlist after adding to cart
        removeFromWishlist(bookId);
      } else {
        setError('Failed to add item to cart.');
      }
    } catch (err) {
      setError('Failed to add item to cart.');
    }
  };

  const isInCart = (bookId) => {
    return Array.isArray(cart?.items) && cart.items.some(item => item.bookId === bookId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#6B7280]">Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#232946] mb-1">My Wishlist</h1>
          <p className="text-sm text-[#6B7280]">Save books you're interested in for later.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-[#6B7280] mb-4">Your wishlist is empty.</p>
          <button
            onClick={() => navigate('/books')}
            className="bg-[#3F8EFC] text-white px-4 py-2 rounded-lg hover:bg-[#2D7AE0] transition"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5E7EB]">
              <thead className="bg-[#F7F7FB]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Book Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Format
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {wishlist.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F7F7FB]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#232946]">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#6B7280]">{item.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#6B7280]">{item.format}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#3F8EFC]">${item.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {!isInCart(item.bookId) && (
                          <button
                            onClick={() => addToCart(item.bookId)}
                            className="text-[#3F8EFC] hover:text-[#2D7AE0] flex items-center"
                          >
                            <ShoppingCartIcon className="h-5 w-5 mr-1" />
                            Add to Cart
                          </button>
                        )}
                        <button
                          onClick={() => removeFromWishlist(item.bookId)}
                          className="text-red-500 hover:text-red-600 flex items-center"
                        >
                          <TrashIcon className="h-5 w-5 mr-1" />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage; 