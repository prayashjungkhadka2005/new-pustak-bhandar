import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permissions } from '../../constants/permissions';

const AdminDashboard = () => {
  const { hasPermission } = usePermissions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Book Management Card */}
          {hasPermission(Permissions.MANAGE_BOOKS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Book Management</h2>
              <p className="text-gray-600 mb-4">Manage your book inventory</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Manage Books
              </button>
            </div>
          )}

          {/* Discount Management Card */}
          {hasPermission(Permissions.MANAGE_DISCOUNTS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Discount Management</h2>
              <p className="text-gray-600 mb-4">Manage discounts and promotions</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Manage Discounts
              </button>
            </div>
          )}

          {/* User Management Card */}
          {hasPermission(Permissions.MANAGE_USERS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-gray-600 mb-4">Manage user accounts and roles</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Manage Users
              </button>
            </div>
          )}

          {/* Reports Card */}
          {hasPermission(Permissions.VIEW_REPORTS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Reports</h2>
              <p className="text-gray-600 mb-4">View sales and inventory reports</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Reports
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 