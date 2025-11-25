import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUsers, FaClipboardList, FaEnvelope, FaComment, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { to: '/dashboard/admin', icon: <FaHome className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/dashboard/admin/users', icon: <FaUsers className="w-5 h-5" />, label: 'Users' },
    { to: '/dashboard/admin/plans', icon: <FaClipboardList className="w-5 h-5" />, label: 'Plans' },
    { to: '/dashboard/admin/subscribers', icon: <FaUsers className="w-5 h-5" />, label: 'Subscribers' },
    { to: '/dashboard/admin/contact-us', icon: <FaEnvelope className="w-5 h-5" />, label: 'Contact Queries' },
    { to: '/dashboard/admin/feedbacks', icon: <FaComment className="w-5 h-5" />, label: 'Feedbacks' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.to
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <span className="text-lg font-medium">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
