// import React, { useEffect, useState, useCallback } from "react";
// import { Link } from "react-router-dom";
// import { Loader } from "../../components";
// import { toast } from "react-hot-toast";
// import API from "../../utils/axios";
// import AdminLayout from "../../components/Layout/AdminLayout";

// // Mock data for fallback when API fails
// const MOCK_STATS = {
//   users: 125,
//   plans: 8,
//   subscribers: 89,
//   contacts: 34,
//   feedbacks: 56,
// };

// // StatCard component for dashboard statistics
// const StatCard = ({ title, value, to, icon = "📊", color = "blue" }) => (
//   <Link
//     to={to}
//     className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col h-full"
//   >
//     <div className="flex items-center justify-between">
//       <h3 className="text-lg font-medium text-gray-600">{title}</h3>
//       <span className="text-2xl">{icon}</span>
//     </div>
//     <p className={`mt-4 text-3xl font-bold text-${color}-600`}>
//       {value.toLocaleString()}
//     </p>
//   </Link>
// );

// // QuickAction component for dashboard actions
// const QuickAction = ({ to, label, icon = "⚡", color = "blue" }) => (
//   <Link
//     to={to}
//     className={`bg-${color}-500 hover:bg-${color}-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors`}
//   >
//     <span className="text-xl">{icon}</span>
//     <span className="font-medium">{label}</span>
//   </Link>
// );

// const AdminDashBoard = () => {
//   const [stats, setStats] = useState({
//     users: 0,
//     plans: 0,
//     subscribers: 0,
//     contacts: 0,
//     feedbacks: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [usingMockData, setUsingMockData] = useState(false);

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Check if user is authenticated
//       const token = localStorage.getItem("token");
//       if (!token) {
//         // navigate('/login');
//         return;
//       }

//       // Set auth header for all requests
//       API.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//       // Define all endpoints to fetch (using relative paths since baseURL is already set in axios config)
//       const endpoints = [
//         { key: "users", url: "/admin/users/count" },
//         { key: "plans", url: "/admin/plans/count" },
//         { key: "subscribers", url: "/admin/subscriptions/count" },
//         { key: "contacts", url: "/admin/contacts/count" },
//         { key: "feedbacks", url: "/admin/feedbacks/count" },
//       ];

//       console.log("Fetching dashboard data from endpoints:", endpoints);

//       // Create an object to store all responses
//       const responses = {};
//       const errors = [];

//       // Fetch data for each endpoint
//       await Promise.all(
//         endpoints.map(async ({ key, url }) => {
//           try {
//             const response = await API.get(url);
//             responses[key] = response.data;

//             if (!response.data?.success) {
//               throw new Error(response.data?.error || "Unknown error");
//             }
//           } catch (err) {
//             console.error(`Error fetching ${key}:`, err);
//             responses[key] = {
//               success: false,
//               error: err.response?.data?.message || err.message,
//             };
//             errors.push({
//               key,
//               error: err.response?.data?.message || err.message,
//             });
//           }
//         })
//       );

//       console.log("API Responses:", responses);

//       // Check if all requests failed
//       if (errors.length === endpoints.length) {
//         throw new Error("All API requests failed");
//       }

//       // Debug log the responses
//       console.log("Raw API responses:", JSON.stringify(responses, null, 2));

//       // Process and update stats based on the actual API response structure
//       const updatedStats = {
//         users: responses.users?.total || MOCK_STATS.users,
//         plans: responses.plans?.total || MOCK_STATS.plans,
//         subscribers: responses.subscribers?.total || MOCK_STATS.subscribers,
//         contacts: responses.contacts?.total || MOCK_STATS.contacts,
//         feedbacks: responses.feedbacks?.total || MOCK_STATS.feedbacks,
//       };

//       console.log("Processed stats:", updatedStats);
//       setStats(updatedStats);

//       // Show error toasts for any failed requests
//       errors.forEach(({ key, error }) => {
//         toast.error(`Using mock data for ${key}: ${error}`);
//       });

//       if (errors.length > 0) {
//         setError(`Using mock data for ${errors.length} items`);
//         setUsingMockData(true);
//       }
//     } catch (err) {
//       console.error("Error in dashboard data fetch:", err);
//       setError("Using mock data due to server error");
//       setStats(MOCK_STATS);
//       setUsingMockData(true);
//       toast.error("Using mock data for dashboard");
//     } finally {
//       setLoading(false);
//     }
//   }, [setLoading, setError, setStats, setUsingMockData]);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       await fetchDashboardData();
//     };

//     if (isMounted) {
//       fetchData();
//     }

//     // Cleanup function to prevent state updates if component unmounts
//     return () => {
//       isMounted = false;
//     };
//   }, [fetchDashboardData]);

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="min-h-[60vh] flex items-center justify-center">
//           <Loader />
//         </div>
//       </AdminLayout>
//     );
//   }

//   if (error) {
//     return (
//       <AdminLayout>
//         <div className="min-h-[60vh] flex items-center justify-center">
//           <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
//             <div className="text-5xl mb-4">⚠️</div>
//             <h2 className="text-2xl font-bold text-red-600 mb-3">
//               {usingMockData ? "Using Mock Data" : "Error Loading Dashboard"}
//             </h2>
//             <p className="text-gray-600 mb-6">
//               {error}.{" "}
//               {usingMockData
//                 ? "Some features may be limited."
//                 : "Please try again."}
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={fetchDashboardData}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//               >
//                 Refresh Data
//               </button>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
//               >
//                 Reload Page
//               </button>
//             </div>
//           </div>
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               Admin Dashboard
//             </h1>
//             <p className="mt-1 text-sm text-gray-600">
//               Welcome back! Here's what's happening with your application.
//               {usingMockData && (
//                 <span className="ml-2 text-yellow-600">(Using mock data)</span>
//               )}
//             </p>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <StatCard
//             title="Total Users"
//             value={stats.users}
//             to="/dashboard/admin/users"
//             icon="👥"
//             color="blue"
//           />

//           <StatCard
//             title="Plans"
//             value={stats.plans}
//             to="/dashboard/admin/plans"
//             icon="📋"
//             color="green"
//           />

//           <StatCard
//             title="Subscribers"
//             value={stats.subscribers}
//             to="/dashboard/admin/subscribers"
//             icon="📊"
//             color="purple"
//           />
//         </div>

//         {/* Quick Actions */}
//         <div className="mb-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Quick Actions
//           </h2>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             <QuickAction
//               to="/dashboard/admin/users"
//               label="Manage Users"
//               icon="👥"
//               color="blue"
//             />

//             <QuickAction
//               to="/dashboard/admin/feedbacks"
//               label="View Feedbacks"
//               icon="💬"
//               color="purple"
//             />

//             <QuickAction
//               to="/dashboard/admin/contact-us"
//               label="Contact Queries"
//               icon="✉️"
//               color="green"
//             />
//           </div>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default AdminDashBoard;





import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components';
import { toast } from 'react-hot-toast';
import { Table, Tag, Space, Button } from 'antd';
import { MessageOutlined, MailOutlined, ClockCircleOutlined } from '@ant-design/icons';
import API from '../../utils/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

// Mock data for fallback when API fails
const MOCK_STATS = {
  users: 125,
  plans: 8,
  subscribers: 89,
  contacts: 34,
  feedbacks: 56
};

// StatCard component for dashboard statistics
const StatCard = ({ title, value, to, icon = '📊', color = 'blue' }) => (
  <div className="h-full">
    <Link 
      to={to}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all h-full"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      </div>
      {value !== 0 && (
        <p className={`mt-2 text-3xl font-bold text-${color}-600`}>
          {value.toLocaleString()}
        </p>
      )}
    </Link>
  </div>
);

// RecentActivityCard component for recent activities
const RecentActivityCard = ({ title, icon, children, to, color = 'blue' }) => (
  <div className="h-full">
    <Link 
      to={to}
      className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all h-full"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-medium text-gray-600 group-hover:text-blue-600">{title}</h3>
      </div>
      <div className="mt-2 max-h-40 overflow-y-auto">
        {children}
      </div>
    </Link>
  </div>
);

// RecentItem component for individual activity items
const RecentItem = ({ title, description, meta, tag, tagColor = 'blue' }) => {
  const handleItemClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // You can add specific click handling here if needed
  };
  
  return (
    <div 
      className="py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors cursor-pointer"
      onClick={handleItemClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          {meta && (
            <div className="mt-1 text-xs text-gray-500 flex items-center">
              <ClockCircleOutlined className="mr-1" />
              {meta}
            </div>
          )}
        </div>
        {tag && (
          <Tag color={tagColor} className="ml-2 flex-shrink-0">
            {tag}
          </Tag>
        )}
      </div>
    </div>
  );
};

// QuickAction component for dashboard actions
const QuickAction = ({ to, label, icon = '⚡', color = 'blue' }) => (
  <Link
    to={to}
    className={`bg-${color}-500 hover:bg-${color}-600 text-white p-4 rounded-lg shadow-md flex items-center justify-center gap-2 transition-colors`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

const AdminDashBoard = () => {
  const [stats, setStats] = useState({
    users: 0,
    plans: 0,
    subscribers: 0,
    contacts: 0,
    feedbacks: 0
  });
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);


  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        // navigate('/login');
        return;
      }

      // Set auth header for all requests
      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Define all endpoints to fetch (using relative paths since baseURL is already set in axios config)
      const endpoints = [
        { key: 'users', url: '/admin/users/count' },
        { key: 'plans', url: '/admin/plans/count' },
        { key: 'subscribers', url: '/admin/subscriptions/count' },
        { key: 'contacts', url: '/admin/contacts/count' },
        { key: 'feedbacks', url: '/admin/feedbacks/count' }
      ];
      
      console.log('Fetching dashboard data from endpoints:', endpoints);

      // Create an object to store all responses
      const responses = {};
      const errors = [];

      // Fetch data for each endpoint
      await Promise.all(
        endpoints.map(async ({ key, url }) => {
          try {
            const response = await API.get(url);
            responses[key] = response.data;
            
            if (!response.data?.success) {
              throw new Error(response.data?.error || 'Unknown error');
            }
          } catch (err) {
            console.error(`Error fetching ${key}:`, err);
            responses[key] = { 
              success: false, 
              error: err.response?.data?.message || err.message 
            };
            errors.push({
              key,
              error: err.response?.data?.message || err.message
            });
          }
        })
      );

      // Fetch recent feedbacks
      try {
        const feedbacksResponse = await API.get('/admin/feedbacks?limit=5');
        if (feedbacksResponse.data?.success) {
          setRecentFeedbacks(feedbacksResponse.data.feedbacks || []);
        } else {
          throw new Error(feedbacksResponse.data?.error || 'Failed to fetch feedbacks');
        }
      } catch (err) {
        console.error('Error fetching recent feedbacks:', err);
        setRecentFeedbacks([]);
      }

      // Fetch recent contact queries
      try {
        const queriesResponse = await API.get('/admin/contacts?limit=5');
        if (queriesResponse.data?.success) {
          setRecentQueries(queriesResponse.data.contacts || []);
        } else {
          throw new Error(queriesResponse.data?.error || 'Failed to fetch contact queries');
        }
      } catch (err) {
        console.error('Error fetching recent queries:', err);
        setRecentQueries([]);
      }

      // Process and update stats based on the actual API response structure
      const updatedStats = {
        users: responses.users?.total || MOCK_STATS.users,
        plans: responses.plans?.total || MOCK_STATS.plans,
        subscribers: responses.subscribers?.total || MOCK_STATS.subscribers,
        contacts: responses.contacts?.total || MOCK_STATS.contacts,
        feedbacks: responses.feedbacks?.total || MOCK_STATS.feedbacks
      };
      
      setStats(updatedStats);

      // Show error toasts for any failed requests
      errors.forEach(({ key, error }) => {
        toast.error(`Using mock data for ${key}: ${error}`);
      });

      if (errors.length > 0) {
        setError(`Using mock data for ${errors.length} items`);
        setUsingMockData(true);
      }

    } catch (err) {
      console.error('Error in dashboard data fetch:', err);
      setError('Using mock data due to server error');
      setStats(MOCK_STATS);
      setUsingMockData(true);
      toast.error('Using mock data for dashboard');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setStats, setUsingMockData]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      await fetchDashboardData();
    };
    
    if (isMounted) {
      fetchData();
    }
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              {usingMockData ? 'Using Mock Data' : 'Error Loading Dashboard'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error}. {usingMockData ? 'Some features may be limited.' : 'Please try again.'}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-300">
              Welcome back! Here's what's happening with your application.
              {usingMockData && (
                <span className="ml-2 text-yellow-400">(Using mock data)</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Combined Grid for All Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8" style={{ gridAutoRows: '1fr' }}>
          {/* Stat Cards */}
          <StatCard 
            title="Total Users" 
            value={stats.users} 
            to="/dashboard/admin/users"
            icon="👥"
            color="blue"
          />
          
          <StatCard 
            title="Plans" 
            value={stats.plans} 
            to="/dashboard/admin/plans"
            icon="📋"
            color="green"
          />
          
          <StatCard 
            title="Subscribers" 
            value={stats.subscribers} 
            to="/dashboard/admin/subscribers"
            icon="📊"
            color="purple"
          />
          
          {/* Recent Feedbacks */}
          <div className="sm:col-span-2 lg:col-span-2 xl:col-span-1">
            <RecentActivityCard 
              title="Feedbacks" 
              icon="💬"
              to="/dashboard/admin/feedbacks"
              color="indigo"
            >
              {recentFeedbacks.length > 0 && recentFeedbacks.map((feedback, index) => (
                <RecentItem
                  key={index}
                  title={feedback.user?.name || 'Anonymous'}
                  description={feedback.message}
                  meta={new Date(feedback.createdAt).toLocaleDateString()}
                  tag={`${feedback.rating} ★`}
                  tagColor={feedback.rating >= 4 ? 'green' : feedback.rating >= 3 ? 'blue' : 'orange'}
                />
              ))}
            </RecentActivityCard>
          </div>

          {/* Recent Contact Queries */}
          <div className="sm:col-span-2 lg:col-span-2 xl:col-span-1">
            <RecentActivityCard 
              title="Queries" 
              icon="✉️"
              to="/dashboard/admin/contact-us"
              color="green"
            >
            {recentQueries.length > 0 && recentQueries.map((query, index) => (
              <RecentItem
                key={index}
                title={query.name}
                description={query.message}
                meta={query.email}
                tag={query.status || 'pending'}
                tagColor={query.status === 'resolved' ? 'green' : 'blue'}
              />
            ))}
            </RecentActivityCard>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashBoard;