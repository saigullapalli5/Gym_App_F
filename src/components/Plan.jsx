// Renaming this file to plan.jsx to ensure consistent casing
import React from "react";
import { Link } from "react-router-dom";
import { ButtonOutline } from "./";
import { exercisePng, planImg } from "../images";
const Plan = ({ name, img, alt, id, monthlyPrice, yearlyPrice, hideViewDetails = false }) => {
  return (
    <div className="text-black rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 p-6 text-center relative">
      <div className="rounded-lg overflow-hidden">
        <img
          src={planImg}
          alt={name}
          className="w-full object-cover rounded-md"
        />
      </div>
      <h3 className="text-xl font-bold mt-4">{name}</h3>
      <div className="mt-4">
        <p className="text-gray-600">Monthly: ${monthlyPrice}</p>
        <p className="text-gray-600">Yearly: ${yearlyPrice}</p>
      </div>
      {!hideViewDetails && (
        <Link to={`/plans/${id}`}>
          <ButtonOutline className="mt-4 w-full">View Details</ButtonOutline>
        </Link>
      )}
    </div>
  );
};

export default Plan;
