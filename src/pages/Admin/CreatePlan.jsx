import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../../config";
import { useAuth } from "../../context/auth";

const CreatePlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { user, token, auth } = useAuth();
  
  // Check if user is authenticated and has admin role
  useEffect(() => {
    // Skip check if auth is still loading
    if (auth?.loading === true) return;
    
    console.log('Auth state - Auth:', auth);
    console.log('Auth state - User:', user);
    console.log('Auth state - Token:', token ? 'Token exists' : 'No token');
    
    // Check if we have auth data in the context
    if (auth) {
      if (!auth.token && !token) {
        console.log('No authentication token found. Redirecting to login...');
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      } else if (auth.user?.role !== 1 && user?.role !== 1) {
        console.log('User does not have admin privileges');
        toast.error('You do not have permission to access this page');
        navigate('/dashboard');
      }
    } else if (!token) {
      // Fallback check if auth context is not available
      console.log('No auth context found. Checking localStorage...');
      const storedAuth = localStorage.getItem('auth');
      if (!storedAuth) {
        console.log('No stored auth found. Redirecting to login...');
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      }
      navigate('/dashboard', { replace: true });
    }
  }, [user, token, auth?.loading, navigate, location.pathname]);

  const [formData, setFormData] = useState(() => ({
    planName: "",
    monthlyPlanAmount: "",
    yearlyPlanAmount: "",
    isPopular: false,
    isActive: true,
    features: {
      waterStations: false,
      lockerRooms: false,
      wifiService: false,
      cardioClass: false,
      refreshment: false,
      groupFitnessClasses: false,
      personalTrainer: false,
      specialEvents: false,
      cafeOrLounge: false,
    }
  }));

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.planName.trim()) {
      newErrors.planName = "Plan name is required";
    }

    const monthlyAmount = parseFloat(formData.monthlyPlanAmount);
    if (isNaN(monthlyAmount) || monthlyAmount <= 0) {
      newErrors.monthlyPlanAmount = "Please enter a valid monthly amount";
    }

    const yearlyAmount = parseFloat(formData.yearlyPlanAmount);
    if (isNaN(yearlyAmount) || yearlyAmount <= 0) {
      newErrors.yearlyPlanAmount = "Please enter a valid yearly amount";
    }

    if (yearlyAmount > monthlyAmount * 12) {
      newErrors.yearlyPlanAmount =
        "Yearly amount should be less than or equal to 12 times the monthly amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target;
    console.log('Input changed:', { name, type, checked, value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Handle feature checkboxes
    if (name.startsWith('feature_')) {
      const featureName = name.replace('feature_', '');
      setFormData(prev => ({
        ...prev,
        features: {
          ...prev.features,
          [featureName]: checked
        }
      }));
    } else {
      // Update regular form fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);

    try {
      // Create a clean payload with the correct structure expected by the backend
      const payload = {
        planName: formData.planName,
        monthlyPlanAmount: parseFloat(formData.monthlyPlanAmount),
        yearlyPlanAmount: parseFloat(formData.yearlyPlanAmount),
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        features: {
          ...formData.features
        },
        createdBy: user?._id,
      };
      
      console.log('Submitting payload:', payload);

      console.log('Sending request to:', `${API_URL}/api/v1/plan/create-plan`);
      console.log('Auth token:', token ? 'Token exists' : 'No token found');
      console.log('Request payload:', payload);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        withCredentials: true
      };

      console.log('Sending request with payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${API_URL}/api/v1/plan/create-plan`, 
        payload, 
        config
      );

      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        toast.success("Plan created successfully!");
        navigate("/dashboard/admin/plans");
      } else {
        console.error('Error in response:', response.data);
        throw new Error(response.data.message || 'Failed to create plan');
      }
    } catch (error) {
      console.error("Error creating plan:", error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Clear any invalid auth state
        localStorage.removeItem('auth');
        // Redirect to login
        navigate('/login', { 
          state: { from: '/dashboard/admin/plans/create' },
          replace: true 
        });
        return;
      }
      
      // Handle validation errors from the server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach((err) => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      } else {
        // Show user-friendly error message
        const errorMessage = error.response?.data?.message || 
          error.message || 
          'Failed to create plan. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Plan</h1>
          <button
            type="button"
            onClick={() => navigate("/admin/plans")}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
          >
            Back to Plans
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium mb-4">Plan Information</h2>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  name="planName"
                  value={formData.planName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.planName ? "border-red-500" : ""
                  }`}
                  required
                />
                {errors.planName && (
                  <p className="mt-1 text-sm text-red-600">{errors.planName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Amount (₹) *
                </label>
                <input
                  type="number"
                  name="monthlyPlanAmount"
                  value={formData.monthlyPlanAmount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.monthlyPlanAmount ? "border-red-500" : ""
                  }`}
                  step="0.01"
                  min="0"
                  required
                />
                {errors.monthlyPlanAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.monthlyPlanAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yearly Amount (₹) *
                </label>
                <input
                  type="number"
                  name="yearlyPlanAmount"
                  value={formData.yearlyPlanAmount}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.yearlyPlanAmount ? "border-red-500" : ""
                  }`}
                  step="0.01"
                  min="0"
                  required
                />
                {errors.yearlyPlanAmount && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.yearlyPlanAmount}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPopular"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="isPopular"
                  className="ml-2 text-sm text-gray-700"
                >
                  Mark as Popular Plan
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active
                </label>
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-medium mb-2">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(formData.features).map(([key, value]) => {
                    // Create a human-readable label
                    const label = key
                      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                      .trim();
                    
                    return (
                      <div key={key} className="flex items-center">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={`feature_${key}`}
                            name={`feature_${key}`}
                            checked={formData.features[key] || false}
                            onChange={handleInputChange}
                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <label
                          htmlFor={`feature_${key}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/plans")}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  "Create Plan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
