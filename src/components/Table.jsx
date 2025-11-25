import React from "react";

const Table = ({ children, className = "", ...props }) => (
  <div className="overflow-x-auto">
    <table
      className={`min-w-full divide-y divide-gray-200 ${className}`}
      {...props}
    >
      {children}
    </table>
  </div>
);

const TableHead = ({ children, ...props }) => (
  <thead className="bg-gray-50" {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="bg-white divide-y divide-gray-200" {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`${className}`} {...props}>
    {children}
  </tr>
);

const TableCell = ({ children, className = "", header = false, ...props }) => {
  const baseClasses = "px-6 py-4 whitespace-nowrap text-sm";
  const headerClasses = header ? "font-medium text-gray-900" : "text-gray-500";

  return (
    <td className={`${baseClasses} ${headerClasses} ${className}`} {...props}>
      {children}
    </td>
  );
};

export { Table, TableHead, TableBody, TableRow, TableCell };
export default Table;
