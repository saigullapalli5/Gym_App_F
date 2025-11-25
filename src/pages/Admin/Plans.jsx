import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { API_URL } from "../../config";

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/plan/getall-plan`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error(error.response?.data?.message || "Failed to fetch plans");
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login', { 
          state: { from: '/dashboard/admin/plans' },
          replace: true 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        setDeletingId(id);
        await axios.delete(`${API_URL}/api/v1/plan/delete-plan/${id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        toast.success("Plan deleted successfully");
        fetchPlans();
      } catch (error) {
        console.error("Error deleting plan:", error);
        toast.error(error.response?.data?.message || "Failed to delete plan");
        
        if (error.response?.status === 401) {
          navigate('/login', { 
            state: { from: '/dashboard/admin/plans' },
            replace: true 
          });
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/plan/update-plan/${id}`,
        { isActive: !currentStatus },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(`Plan ${currentStatus ? "deactivated" : "activated"}`);
      fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error(error.response?.data?.message || "Failed to update plan status");
      
      if (error.response?.status === 401) {
        navigate('/login', { 
          state: { from: '/dashboard/admin/plans' },
          replace: true 
        });
      }
    }
  };

  const togglePopular = async (id, currentPopular) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/plan/toggle-popular/${id}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success(`Plan marked as ${!currentPopular ? 'popular' : 'not popular'}`);
      fetchPlans();
    } catch (error) {
      console.error("Error toggling popular status:", error);
      toast.error(error.response?.data?.message || "Failed to update popular status");
      
      if (error.response?.status === 401) {
        navigate('/login', { 
          state: { from: '/dashboard/admin/plans' },
          replace: true 
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/admin/plans/edit/${id}`);
  };

  const handleCreateNew = () => {
    navigate("/dashboard/admin/plans/create");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Plans</h2>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Create Plan
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yearly
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popular
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-lg mb-4">No plans found</p>
                      <p className="text-sm text-gray-500 mb-4">Click the 'Create Plan' button above to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {plan.planName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(plan.features)
                          .filter(([_, value]) => value)
                          .map(([key]) => key.replace(/([A-Z])/g, " $1").trim())
                          .slice(0, 3)
                          .join(", ")}
                        {Object.values(plan.features).filter(Boolean).length >
                          3 && "..."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{plan.monthlyPlanAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{plan.yearlyPlanAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        onClick={() => toggleStatus(plan._id, plan.isActive)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          plan.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap cursor-pointer"
                      onClick={() => togglePopular(plan._id, plan.isPopular)}
                      title={`Click to mark as ${plan.isPopular ? 'not popular' : 'popular'}`}
                    >
                      {plan.isPopular ? (
                        <FaCheck className="text-green-500 hover:text-green-600" />
                      ) : (
                        <FaTimes className="text-gray-400 hover:text-gray-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(plan._id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id)}
                        className={`text-red-600 hover:text-red-900 ${
                          deletingId === plan._id ? "opacity-50" : ""
                        }`}
                        title="Delete"
                        disabled={deletingId === plan._id}
                      >
                        {deletingId === plan._id ? (
                          <div className="h-4 w-4 border-2 border-t-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Plans;
