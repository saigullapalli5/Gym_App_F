import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import AdminHeader from '../AdminHeader';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showHeader, setShowHeader] = useState(true);

  // Hide sidebar and header on specific routes
  useEffect(() => {
    const hideSidebarPaths = [
      '/dashboard/admin/subscribers',
      '/dashboard/admin'
    ];
    const hideHeaderPaths = [
      '/dashboard/admin',
      '/dashboard/admin/subscribers'
    ];
    
    setShowSidebar(!hideSidebarPaths.some(path => location.pathname.startsWith(path)));
    setShowHeader(!hideHeaderPaths.some(path => location.pathname.startsWith(path)));
  }, [location]);
  
  return (
    <div className={`${showSidebar ? 'flex' : 'block'} h-screen bg-gray-900`}>
      {/* Sidebar */}
      {showSidebar && (
        <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
          <Sidebar />
        </div>
      )}
      
      {/* Main Content */}
      <div className={`${showSidebar ? 'flex-1' : 'w-full'} flex flex-col overflow-hidden`}>
        {/* Header - Conditionally rendered */}
        {showHeader && (
          <AdminHeader 
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
            hideMenuToggle={!showSidebar}
          />
        )}
        
        {/* Page Content */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${!showHeader ? 'pt-0' : ''}`}>
          <div className={`${showSidebar ? 'container' : 'w-full'} mx-auto p-4 sm:p-6 pb-20`}>
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
