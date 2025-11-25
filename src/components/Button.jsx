import React from "react";

const Button = ({ text, icon, className = "", ...rest }) => {
  return (
    <button
      className={`px-4 py-2 font-medium rounded-md flex items-center justify-center space-x-2 transition-all ${className}`}
      {...rest}
    >
      {icon && <span>{icon}</span>}
      <span>{text}</span>
    </button>
  );
};

export default Button;
