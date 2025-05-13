import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Permissions } from '../../constants/permissions';

const StaffDashboard = () => {
  const { hasPermission } = usePermissions();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Staff Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Orders Management Card */}
          {hasPermission(Permissions.VIEW_ORDERS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Orders</h2>
              <p className="text-gray-600 mb-4">View and manage customer orders</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Orders
              </button>
            </div>
          )}

          {/* User View Card */}
          {hasPermission(Permissions.VIEW_USERS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <p className="text-gray-600 mb-4">View member and staff details</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Users
              </button>
            </div>
          )}

          {/* Reports Card */}
          {hasPermission(Permissions.VIEW_REPORTS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Reports</h2>
              <p className="text-gray-600 mb-4">View sales and order reports</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Reports
              </button>
            </div>
          )}

          {/* Notifications Card */}
          {hasPermission(Permissions.VIEW_NOTIFICATIONS) && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <p className="text-gray-600 mb-4">View system notifications</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 