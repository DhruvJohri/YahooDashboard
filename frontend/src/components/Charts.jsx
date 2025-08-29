// import React from 'react';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const Charts = ({ companies, loading }) => {
//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <div className="card">
//           <div className="animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//             <div className="h-48 bg-gray-200 rounded"></div>
//           </div>
//         </div>
//         <div className="card">
//           <div className="animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//             <div className="h-48 bg-gray-200 rounded"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Process data for Sector pie chart
//   const sectorData = companies.reduce((acc, company) => {
//     const sector = company.Sector || 'Unknown';
//     acc[sector] = (acc[sector] || 0) + 1;
//     return acc;
//   }, {});

//   const sectorChartData = Object.entries(sectorData).map(([sector, count]) => ({
//     name: sector,
//     value: count
//   }));

//   // Process data for Industry bar chart
//   const industryData = companies.reduce((acc, company) => {
//     const Valuation = company.Valuation || 'Unknown';
//     acc[Valuation] = (acc[Valuation] || 0) + 1;
//     return acc;
//   }, {});

//   const industryChartData = Object.entries(industryData)
//     .map(([Valuation, count]) => ({
//       name: Valuation.length > 20 ? Valuation.substring(0, 20) + '...' : Valuation,
//       count
//     }))
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 8); // Show top 8 industries

//   const COLORS = [
//     '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
//     '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Companies by Sector
//         </h3>
//         {sectorChartData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={200}>
//             <PieChart>
//               <Pie
//                 data={sectorChartData}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//                 label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
//               >
//                 {sectorChartData.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="h-48 flex items-center justify-center text-gray-500">
//             No sector data available
//           </div>
//         )}
//       </div>

//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Top Industries
//         </h3>
//         {industryChartData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart
//               data={industryChartData}
//               margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="name" 
//                 angle={-45}
//                 textAnchor="end"
//                 height={100}
//                 fontSize={12}
//               />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="count" fill="#3B82F6" />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <div className="h-72 flex items-center justify-center text-gray-500">
//             No industry data available
//           </div>
//         )}
//       </div>

//       <div className="card">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Quick Stats
//         </h3>
//         <div className="space-y-3">
//           <div className="flex justify-between">
//             <span className="text-sm text-gray-600">Total Companies</span>
//             <span className="text-sm font-medium">{companies.length}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-sm text-gray-600">Unique Sectors</span>
//             <span className="text-sm font-medium">{Object.keys(sectorData).length}</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-sm text-gray-600">Unique Industries</span>
//             <span className="text-sm font-medium">{Object.keys(industryData).length}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Charts;

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Dialog } from "@headlessui/react";
import { Expand } from "lucide-react";

const Charts = ({ companies, loading }) => {
  const [open, setOpen] = useState(false);
  const [activeChart, setActiveChart] = useState(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card animate-pulse h-48"></div>
        <div className="card animate-pulse h-48"></div>
      </div>
    );
  }

  // Process data for Sector pie chart
  const sectorData = companies.reduce((acc, company) => {
    const sector = company.Sector || "Unknown";
    acc[sector] = (acc[sector] || 0) + 1;
    return acc;
  }, {});

  const sectorChartData = Object.entries(sectorData).map(([sector, count]) => ({
    name: sector,
    value: count,
  }));

  // Process data for Industry bar chart
  const industryData = companies.reduce((acc, company) => {
    const Valuation = company.Valuation || "Unknown";
    acc[Valuation] = (acc[Valuation] || 0) + 1;
    return acc;
  }, {});

  const industryChartData = Object.entries(industryData)
    .map(([Valuation, count]) => ({
      name:
        Valuation.length > 20 ? Valuation.substring(0, 20) + "..." : Valuation,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#84CC16",
    "#EC4899",
    "#14B8A6",
  ];

  // Chart renderer (reused inside modal & compact view)
  const renderSectorChart = (big = false) => (
    <ResponsiveContainer width="100%" height={big ? 400 : 200}>
      <PieChart>
        <Pie
          data={sectorChartData}
          cx="50%"
          cy="50%"
          innerRadius={big ? 100 : 40}
          outerRadius={big ? 160 : 80}
          dataKey="value"
          onMouseEnter={(data, index) => {}}
        >
          {sectorChartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderIndustryChart = (big = false) => (
    <ResponsiveContainer width="100%" height={big ? 400 : 300}>
      <BarChart
        data={big ? industryChartData : industryChartData.slice(0, 8)}
        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={100}
          fontSize={big ? 14 : 10}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Pie Chart Card */}
      <div className="card relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between">
          Companies by Sector
          <button
            onClick={() => {
              setActiveChart("sector");
              setOpen(true);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <Expand size={18} />
          </button>
        </h3>
        {sectorChartData.length > 0 ? (
          renderSectorChart()
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-500">
            No sector data available
          </div>
        )}
      </div>

      {/* Bar Chart Card */}
      <div className="card relative">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex justify-between">
          Top Industries
          <button
            onClick={() => {
              setActiveChart("industry");
              setOpen(true);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <Expand size={18} />
          </button>
        </h3>
        {industryChartData.length > 0 ? (
          renderIndustryChart()
        ) : (
          <div className="h-72 flex items-center justify-center text-gray-500">
            No industry data available
          </div>
        )}
      </div>

      {/* Modal Popup */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-2xl p-6 w-[90%] max-w-5xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {activeChart === "sector"
                ? "Full Sector Distribution"
                : "Full Industry Distribution"}
            </h2>
            <button onClick={() => setOpen(false)} className="text-gray-500">
              ✖
            </button>
          </div>
          {activeChart === "sector" ? renderSectorChart(true) : renderIndustryChart(true)}
        </div>
      </Dialog>
    </div>
  );
};

export default Charts;

// new code

