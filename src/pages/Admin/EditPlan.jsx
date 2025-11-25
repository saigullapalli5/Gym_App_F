import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../../config";

const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    planName: "",
    monthlyPlanAmount: "",
    yearlyPlanAmount: "",
    isPopular: false,
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
    },
    isActive: true,
  });

  // Fetch plan data
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${API_URL}/api/v1/plan/get-plan/${id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (data.success && data.plan) {
          console.log('Fetched plan data:', data.plan);
          
          // Ensure features exist and have proper boolean values
          const planFeatures = data.plan.features || {};
          
          setFormData({
            planName: data.plan.planName,
            monthlyPlanAmount: data.plan.monthlyPlanAmount,
            yearlyPlanAmount: data.plan.yearlyPlanAmount,
            isPopular: Boolean(data.plan.isPopular),
            isActive: Boolean(data.plan.isActive),
            features: {
              waterStations: Boolean(planFeatures.waterStations),
              lockerRooms: Boolean(planFeatures.lockerRooms),
              wifiService: Boolean(planFeatures.wifiService),
              cardioClass: Boolean(planFeatures.cardioClass),
              refreshment: Boolean(planFeatures.refreshment),
              groupFitnessClasses: Boolean(planFeatures.groupFitnessClasses),
              personalTrainer: Boolean(planFeatures.personalTrainer),
              specialEvents: Boolean(planFeatures.specialEvents),
              cafeOrLounge: Boolean(planFeatures.cafeOrLounge),
            }
          });
          
          console.log('Form data after setting:', {
            ...data.plan,
            features: {
              waterStations: Boolean(planFeatures.waterStations),
              lockerRooms: Boolean(planFeatures.lockerRooms),
              wifiService: Boolean(planFeatures.wifiService),
              cardioClass: Boolean(planFeatures.cardioClass),
              refreshment: Boolean(planFeatures.refreshment),
              groupFitnessClasses: Boolean(planFeatures.groupFitnessClasses),
              personalTrainer: Boolean(planFeatures.personalTrainer),
              specialEvents: Boolean(planFeatures.specialEvents),
              cafeOrLounge: Boolean(planFeatures.cafeOrLounge),
            }
          });
        } else {
          throw new Error(data.message || 'Failed to fetch plan');
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        toast.error("Failed to load plan data");
        navigate("/admin/plans");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log('Input changed:', { name, value, type, checked });

    if (name.startsWith('feature_')) {
      const featureName = name.replace('feature_', '');
      setFormData(prev => {
        const updatedFeatures = {
          ...prev.features,
          [featureName]: checked
        };
        console.log('Updated features:', updatedFeatures);
        return {
          ...prev,
          features: updatedFeatures
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    
    console.log('Updated formData:', formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Prepare the features object with all features
      const features = {
        waterStations: formData.features.waterStations || false,
        lockerRooms: formData.features.lockerRooms || false,
        wifiService: formData.features.wifiService || false,
        cardioClass: formData.features.cardioClass || false,
        refreshment: formData.features.refreshment || false,
        groupFitnessClasses: formData.features.groupFitnessClasses || false,
        personalTrainer: formData.features.personalTrainer || false,
        specialEvents: formData.features.specialEvents || false,
        cafeOrLounge: formData.features.cafeOrLounge || false,
      };

      // Prepare the payload with the correct structure
      const payload = {
        planName: formData.planName,
        monthlyPlanAmount: parseFloat(formData.monthlyPlanAmount),
        yearlyPlanAmount: parseFloat(formData.yearlyPlanAmount),
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        features: features // Send features as a nested object
      };

      console.log('Updating plan with payload:', JSON.stringify(payload, null, 2));

      const { data } = await axios.put(
        `${API_URL}/api/v1/plan/update-plan/${id}`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (data.success) {
        toast.success("Plan updated successfully!");
        navigate("/dashboard/admin/plans");
      } else {
        throw new Error(data.message || 'Failed to update plan');
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error(error.response?.data?.message || "Failed to update plan");
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login', { 
          state: { from: `/dashboard/admin/plans/edit/${id}` },
          replace: true 
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Plan</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/admin/plans")}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={(e) => e.preventDefault()}>
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
                  className="w-full p-2 border rounded-md"
                  required
                />
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
                  className="w-full p-2 border rounded-md"
                  step="0.01"
                  min="0"
                  required
                />
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
                  className="w-full p-2 border rounded-md"
                  step="0.01"
                  min="0"
                  required
                />
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
                            checked={Boolean(formData.features[key])}
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPlan;
