import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  TagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  MegaphoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Books', href: '/admin/books/add', icon: BookOpenIcon },
  { name: 'Discounts', href: '/admin/discounts', icon: TagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Members', href: '/admin/users', icon: UserGroupIcon },
  { name: 'Announcements', href: '/admin/announcements', icon: MegaphoneIcon },
];

const AdminSidebar = ({ isOpen }) => {
  const { user } = useAuth();
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 h-screen top-0`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">PB</span>
          </div>
          <span className="text-xl font-bold text-gray-900">PustakBhandar</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 px-2">
        <div className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-700'
                }`
              }
            >
              <item.icon
                className={`mr-4 h-5 w-5 ${
                  location.pathname === item.href
                    ? 'text-blue-700'
                    : 'text-gray-400 group-hover:text-blue-500'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Admin Info */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{user?.fullName?.[0] || 'A'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 