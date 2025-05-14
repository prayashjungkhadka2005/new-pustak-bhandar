import React from 'react';
import { Outlet } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';

const MemberLayout = () => {
  return (
    <div className="h-screen bg-white overflow-hidden">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 h-screen w-64 top-0 z-30">
        <MemberSidebar />
      </div>
      {/* Main Content Area */}
      <div className="flex flex-col h-screen ml-64">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20">
          <MemberHeader />
        </div>
        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout; 