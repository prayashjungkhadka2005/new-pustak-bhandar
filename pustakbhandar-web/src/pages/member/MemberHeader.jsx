import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

const MemberHeader = () => {
  const { user } = useAuth();
  // For now, fake notifications count
  const notifications = [
    { id: 1, message: 'Order completed.' },
    { id: 2, message: 'New discount available!' },
  ];
  const name = user?.fullName ? user.fullName.split(' ')[0] : 'Member';
  return (
    <header className="bg-white border-b-2 border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-xl font-bold text-[#232946]">Welcome, {user?.fullName || 'Member'}!</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-[#3F8EFC]">{user?.email}</span>
      </div>
    </header>
  );
};

export default MemberHeader; 