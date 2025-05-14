import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Permissions } from '../../constants/permissions';

const navigation = [
  {
    name: 'Orders',
    href: '/staff/orders',
    icon: ClipboardDocumentListIcon,
    permission: Permissions.VIEW_ORDERS
  },
  {
    name: 'Users',
    href: '/staff/users',
    icon: UserGroupIcon,
    permission: Permissions.VIEW_USERS
  },
  {
    name: 'Reports',
    href: '/staff/reports',
    icon: ChartBarIcon,
    permission: Permissions.VIEW_REPORTS
  },
  {
    name: 'Notifications',
    href: '/staff/notifications',
    icon: BellIcon,
    permission: Permissions.VIEW_NOTIFICATIONS
  }
];

const StaffSidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  const filteredNavigation = navigation.filter((item) => hasPermission(item.permission));

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
          <span className="text-xl font-bold text-gray-900">Staff Portal</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-5 px-2">
        <div className="space-y-2">
          {filteredNavigation.map((item) => (
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

      {/* Staff Info */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">{user?.fullName?.[0] || 'S'}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Staff'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'Staff Member'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSidebar; 