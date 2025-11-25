import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import API from '../../utils/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

const NewSubscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    user: '',
    plan: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'active',
    paymentStatus: 'paid'
  });

  // Fetch users and plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching users and plans...');
        const [usersRes, plansRes] = await Promise.all([
          API.get('/admin/users'),      // Will resolve to /api/v1/admin/users
          API.get('/plan/getall-plan')  // Will resolve to /api/v1/plan/getall-plan
        ]);
        console.log('Full users response:', usersRes);
        console.log('Full plans response:', plansRes);
        
        // Log the exact structure of the responses
        console.log('Users response data structure:', {
          hasUsers: 'users' in usersRes.data,
          isUsersArray: Array.isArray(usersRes.data?.users),
          dataKeys: Object.keys(usersRes.data || {})
        });
        
        console.log('Plans response data structure:', {
          isArray: Array.isArray(plansRes.data),
          dataKeys: Object.keys(plansRes.data || {})
        });
        
        // Handle users response - try different possible response structures
        let usersData = [];
        if (Array.isArray(usersRes.data)) {
          usersData = usersRes.data; // If response is directly an array
        } else if (Array.isArray(usersRes.data?.users)) {
          usersData = usersRes.data.users; // If response is { users: [...] }
        } else if (usersRes.data?.data) {
          usersData = Array.isArray(usersRes.data.data) ? usersRes.data.data : [];
        }
        
        console.log('Processed users data:', usersData);
        setUsers(usersData);
        
        // Handle plans response - try different possible response structures
        let plansData = [];
        if (Array.isArray(plansRes.data)) {
          plansData = plansRes.data; // If response is directly an array
        } else if (Array.isArray(plansRes.data?.plans)) {
          plansData = plansRes.data.plans; // If response is { plans: [...] }
        } else if (plansRes.data?.data) {
          plansData = Array.isArray(plansRes.data.data) ? plansRes.data.data : [];
        }
        
        console.log('Processed plans data:', plansData);
        setPlans(plansData);
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user || !formData.plan) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Find the selected plan to get plan details
      const selectedPlan = plans.find(p => p._id === formData.plan);
      const selectedUser = users.find(u => u._id === formData.user);
      
      if (!selectedPlan || !selectedUser) {
        throw new Error('Invalid plan or user selected');
      }

      const subscriptionData = {
        userName: selectedUser.name,
        planType: selectedPlan.planName,
        planAmount: selectedPlan.monthlyPlanAmount, // or yearly based on selection
        planId: selectedPlan._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        paymentStatus: formData.paymentStatus
      };

      console.log('Creating subscription with data:', subscriptionData);
      // Prepare the subscription data in the format expected by the backend
      const subscriptionPayload = {
        userName: selectedUser.name,
        planType: selectedPlan.planName,
        planAmount: selectedPlan.monthlyPlanAmount,
        planId: selectedPlan._id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status || 'active',
        paymentStatus: formData.paymentStatus || 'paid'
      };

      console.log('Sending subscription data:', subscriptionPayload);
      
      // Make the API request
      const response = await API.post('/subscription/create-subscription', subscriptionPayload);
      
      console.log('Subscription response:', response);
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Subscription created successfully');
        navigate('/dashboard/admin/subscribers');
      } else {
        throw new Error(response.data.message || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('Error creating subscription:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create subscription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate end date based on plan duration
  const updateEndDate = (planId) => {
    const selectedPlan = plans.find(p => p._id === planId);
    if (selectedPlan) {
      const startDate = formData.startDate ? new Date(formData.startDate) : new Date();
      const months = selectedPlan.durationMonths || 1;
      
      // Create a new date to avoid mutating the original
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + months);
      
      // Format as YYYY-MM-DD for the date input
      const formattedDate = endDate.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        endDate: formattedDate
      }));
    }
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Subscription</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FiArrowLeft className="mr-1" /> Back
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={(e) => {
                    handleChange(e);
                    updateEndDate(e.target.value);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Plan</option>
                  {plans.map(plan => (
                    <option key={plan._id} value={plan._id}>
                      {plan.planName} ({plan.durationMonths} months)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ''}
                  min={formData.startDate || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.plan && (
                  <p className="mt-1 text-xs text-gray-500">
                    End date will be calculated automatically when a plan is selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Subscription
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
};

export default NewSubscription;
