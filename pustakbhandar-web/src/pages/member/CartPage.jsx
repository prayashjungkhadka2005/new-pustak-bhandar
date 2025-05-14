import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, discountApplied: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stackableDiscount, setStackableDiscount] = useState(null);

  useEffect(() => {
    fetchCart();
    fetchDiscounts();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart`, { headers });
      const data = await res.json();
      if (res.ok) {
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setCart({ items: data, totalAmount: data.reduce((sum, item) => sum + item.subtotal, 0), discountApplied: 0 });
        } else if (data.data && Array.isArray(data.data)) {
          setCart({ 
            items: data.data, 
            totalAmount: data.data.reduce((sum, item) => sum + item.subtotal, 0), 
            discountApplied: data.discountApplied || 0 
          });
        } else {
          setCart({ items: [], totalAmount: 0, discountApplied: 0 });
        }
      } else {
        setError('Failed to load cart.');
        setCart({ items: [], totalAmount: 0, discountApplied: 0 });
      }
    } catch (err) {
      setError('Failed to load cart.');
      setCart({ items: [], totalAmount: 0, discountApplied: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/discounts`, { headers });
      const data = await res.json();
      if (res.ok) {
        // Handle both array and object responses
        const discounts = Array.isArray(data) ? data : (data.data || []);
        // Find stackable discount (10% after 10 orders)
        const stackable = discounts.find(d => d.type === 'stackable' && d.eligible);
        setStackableDiscount(stackable);
      }
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
      setStackableDiscount(null);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      if (res.ok) {
        fetchCart(); // Refresh cart after update
      }
    } catch (err) {
      setError('Failed to update quantity.');
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from your cart?')) return;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/cart/${itemId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        fetchCart(); // Refresh cart after removal
      }
    } catch (err) {
      setError('Failed to remove item.');
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.totalAmount || 0;
    const discount = stackableDiscount ? (subtotal * 0.10) : 0; // 10% stackable discount
    return (subtotal - discount).toFixed(2);
  };

  const handleProceedToOrder = () => {
    navigate('/member/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#6B7280]">Loading cart...</div>
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
          <h1 className="text-2xl font-bold text-[#232946] mb-1">Shopping Cart</h1>
          <p className="text-sm text-[#6B7280]">Review your items and proceed to checkout.</p>
        </div>
      </div>

      {(!cart.items || cart.items.length === 0) ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-[#6B7280] mb-4">Your cart is empty.</p>
          <button
            onClick={() => navigate('/books')}
            className="bg-[#3F8EFC] text-white px-4 py-2 rounded-lg hover:bg-[#2D7AE0] transition"
          >
            Browse Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#232946]">{item.bookTitle}</h3>
                    <p className="text-sm text-[#6B7280]">{item.format}</p>
                    <p className="text-[#3F8EFC] font-medium mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-[#F7F7FB]"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="h-4 w-4 text-[#6B7280]" />
                      </button>
                      <span className="px-4 py-2 text-[#232946]">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-[#F7F7FB]"
                      >
                        <PlusIcon className="h-4 w-4 text-[#6B7280]" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal:</span>
                    <span className="font-medium text-[#232946]">${item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-[#232946] mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal:</span>
                  <span className="font-medium text-[#232946]">${(cart.totalAmount || 0).toFixed(2)}</span>
                </div>
                {stackableDiscount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3F8EFC]">Stackable Discount (10%):</span>
                    <span className="font-medium text-[#3F8EFC]">-${((cart.totalAmount || 0) * 0.10).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#E5E7EB] pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-[#232946]">Total:</span>
                    <span className="font-bold text-[#232946]">${calculateTotal()}</span>
                  </div>
                </div>
                <button
                  onClick={handleProceedToOrder}
                  className="w-full bg-[#3F8EFC] text-white py-3 rounded-lg hover:bg-[#2D7AE0] transition"
                >
                  Proceed to Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;