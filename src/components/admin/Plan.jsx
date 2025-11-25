import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const Plan = ({ plan, onEdit, onDelete }) => {
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get all enabled features
  const enabledFeatures = [
    plan.waterStations && "Water Stations",
    plan.lockerRooms && "Locker Rooms",
    plan.wifiService && "WiFi Service",
    plan.cardioClass && "Cardio Classes",
    plan.refreshment && "Refreshments",
    plan.groupFitnessClasses && "Group Fitness",
    plan.personalTrainer && "Personal Trainer",
    plan.specialEvents && "Special Events",
    plan.cafeOrLounge && "Cafe/Lounge Access",
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">{plan.planName}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(plan)}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Edit plan"
            >
              <FaEdit className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(plan._id)}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete plan"
            >
              <FaTrash className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {formatPrice(plan.monthlyPlanAmount)}
            <span className="text-base font-normal text-gray-500">/month</span>
          </p>
          <p className="text-sm text-gray-500">
            or {formatPrice(plan.yearlyPlanAmount)}/year
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Features:</h4>
          <ul className="space-y-2">
            {enabledFeatures.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Plan;
