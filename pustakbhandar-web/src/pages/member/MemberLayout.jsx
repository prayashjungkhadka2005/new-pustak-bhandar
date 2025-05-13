import React from 'react';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';

const MemberLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      <MemberSidebar />
      <div className="flex-1 flex flex-col">
        <MemberHeader />
        <main className="flex-1 p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MemberLayout; 