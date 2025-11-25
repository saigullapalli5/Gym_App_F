import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader } from '../../components';
import { BASE_URL } from '../../utils/fetchData';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { TiTick, TiCancel } from 'react-icons/ti';

const PlanDetail = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const getAllPlans = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/v1/plan/getall-plan`);
      if (data?.success) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllPlans();
    AOS.init({ duration: 1000 });
  }, []);

  const renderFeature = (value) => {
    const isAvailable = value === true || value === "Available";
    return isAvailable ? (
      <TiTick className="text-green-500 text-xl flex-shrink-0" />
    ) : (
      <TiCancel className="text-red-500 text-xl flex-shrink-0" />
    );
  };

  const togglePlanDetails = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-12 text-center">Our Membership Plans</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={plan._id}
              className="bg-gray-800 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-all duration-300 flex flex-col h-full"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{plan.planName}</h2>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-100">Monthly</p>
                    <p className="text-2xl font-bold">₹{plan.monthlyPlanAmount}<span className="text-base font-normal">/month</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Yearly</p>
                    <p className="text-2xl font-bold">₹{plan.yearlyPlanAmount}<span className="text-base font-normal">/year</span></p>
                    <p className="text-xs text-blue-200">
                      (Save {Math.round(100 - (plan.yearlyPlanAmount / (plan.monthlyPlanAmount * 12) * 100))}%)
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {Object.entries(plan.features || {
                    waterStations: false,
                    lockerRooms: false,
                    wifiService: false,
                    cardioClass: false,
                    refreshment: false,
                    groupFitnessClasses: false,
                    personalTrainer: false,
                    specialEvents: false,
                    cafeOrLounge: false,
                  })
                  .filter(([_, value]) => value === true) // Only show selected features
                  .map(([key, _], idx) => {
                    // Create a human-readable label
                    const label = key
                      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                      .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                      .trim();
                      
                    return (
                      <div key={key} className="flex items-start">
                        <span className="mr-2 mt-1">
                          <TiTick className="text-green-500 text-xl flex-shrink-0" />
                        </span>
                        <span className="text-gray-300">{label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => togglePlanDetails(plan._id)}
                    className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    {expandedPlan === plan._id ? 'Show Less' : 'View All Features'}
                  </button>
                  
                  <Link
                    to={`/dashboard/user/plan-subscribe/${plan._id}`}
                    className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                  >
                    Subscribe Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;