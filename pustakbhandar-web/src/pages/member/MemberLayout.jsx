import React from 'react';
import { Outlet } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';

const MemberLayout = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <MemberSidebar />
      <div className="flex-1 flex flex-col">
        <MemberHeader />
        <main className="flex-1 p-6 bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout; 