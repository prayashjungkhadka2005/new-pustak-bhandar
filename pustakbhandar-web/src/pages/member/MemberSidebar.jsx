import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UserIcon, ShoppingCartIcon, HeartIcon, ShoppingBagIcon, StarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/member/dashboard', icon: HomeIcon },
  { name: 'Profile', href: '/member/profile', icon: UserIcon },
  { name: 'Orders', href: '/member/orders', icon: ShoppingCartIcon },
  { name: 'Cart', href: '/member/cart', icon: ShoppingBagIcon },
  { name: 'Wishlist', href: '/member/wishlist', icon: HeartIcon },
  { name: 'Ratings & Reviews', href: '/member/reviews', icon: StarIcon },
];

const MemberSidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  return (
    <div className="w-64 h-full bg-[#232946] shadow-lg border-r border-[#E5E7EB] flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-[#E5E7EB]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-[#3F8EFC]">PB</span>
          </div>
          <span className="text-xl font-bold text-white">PustakBhandar</span>
        </div>
      </div>
      {/* Navigation */}
      <nav className="mt-5 px-2 flex-1">
        <div className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                location.pathname === item.href
                  ? 'bg-white text-[#3F8EFC] font-semibold shadow-sm'
                  : 'text-white hover:bg-[#3F8EFC] hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-4 h-5 w-5 ${
                  location.pathname === item.href
                    ? 'text-[#3F8EFC]'
                    : 'text-white group-hover:text-white'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>
      {/* Member Info */}
      <button
        className="w-full flex items-center space-x-3 p-4 border-t border-[#E5E7EB] bg-[#232946] hover:bg-[#1a1f36] transition-colors duration-200 focus:outline-none"
        style={{ minHeight: '72px' }}
        // onClick={() => { /* future: open profile modal or page */ }}
      >
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-[#232946]">{user?.fullName?.[0] || 'M'}</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium text-white">{user?.fullName || 'Member'}</span>
          <span className="text-xs text-[#E5E7EB]">{user?.email || 'member@example.com'}</span>
        </div>
      </button>
    </div>
  );
};

export default MemberSidebar; 