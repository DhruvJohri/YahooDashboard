// import React, { useState, useEffect } from 'react';
// import { fetchStats } from '../services/api.js';

// const Dashboard = () => {
//   const [stats, setStats] = useState({
//     totalCompanies: 0,
//     lastScraped: null,
//     recentActivity: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchStats();
//       setStats(data);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load dashboard stats');
//       console.error('Error loading stats:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Never';
//     return new Date(dateString).toLocaleString();
//   };

//   if (loading) {
//     return (
//       <div className="p-8">
//         <div className="animate-pulse space-y-6">
//           <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {[1, 2, 3].map(i => (
//               <div key={i} className="card">
//                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
//                 <div className="h-8 bg-gray-200 rounded w-1/4"></div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8">
//       <div className="mb-8">
//         <h2 className="text-3xl font-bold text-gray-900 mb-2">
//           Dashboard Overview
//         </h2>
//         <p className="text-gray-600">
//           Monitor your Yahoo Finance scraper performance and data
//         </p>
//       </div>

//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <p className="text-red-600">{error}</p>
//           <button 
//             onClick={loadStats}
//             className="mt-2 text-red-600 hover:text-red-800 underline"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 mb-1">
//                 Total Companies
//               </p>
//               <p className="text-3xl font-bold text-blue-600">
//                 {stats.totalCompanies.toLocaleString()}
//               </p>
//             </div>
//             <div className="text-4xl">🏢</div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 mb-1">
//                 Last Scraped
//               </p>
//               <p className="text-sm font-semibold text-gray-900">
//                 {formatDate(stats.lastScraped)}
//               </p>
//             </div>
//             <div className="text-4xl">⏰</div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600 mb-1">
//                 Scraper Status
//               </p>
//               <p className="text-sm font-semibold text-green-600">
//                 ✅ Active
//               </p>
//             </div>
//             <div className="text-4xl">🔄</div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Recent Activity
//           </h3>
//           <div className="space-y-3">
//             {stats.recentActivity.length > 0 ? (
//               stats.recentActivity.map((activity, index) => (
//                 <div 
//                   key={index}
//                   className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
//                 >
//                   <div>
//                     <p className="font-medium text-gray-900">
//                       {activity.symbol}
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       {activity.company}
//                     </p>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     {formatDate(activity.scraped_at)}
//                   </p>
//                 </div>
//               ))
//             ) : (
//               <p className="text-gray-500 text-sm">No recent activity</p>
//             )}
//           </div>
//         </div>

//         <div className="card">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             System Status
//           </h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">MongoDB</span>
//               <span className="text-sm font-medium text-green-600">Connected</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">API Server</span>
//               <span className="text-sm font-medium text-green-600">Running</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-sm text-gray-600">Next Scrape</span>
//               <span className="text-sm font-medium text-blue-600">
//                 {stats.lastScraped ? 
//                   formatDate(new Date(new Date(stats.lastScraped).getTime() + 6 * 60 * 60 * 1000)) :
//                   'Pending'
//                 }
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// new code


import React, { useState, useEffect } from "react";
import { fetchStats } from "../services/api.js";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    lastScraped: null,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (stats.lastScraped) {
      const interval = setInterval(() => {
        const nextScrape =
          new Date(stats.lastScraped).getTime() + 6 * 60 * 60 * 1000;
        const diff = nextScrape - new Date().getTime();
        setTimeLeft(diff > 0 ? diff : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stats.lastScraped]);

  const loadStats = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const data = await fetchStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard stats");
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const formatCountdown = (ms) => {
    if (!ms) return "0s";
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Overview
          </h2>
          <p className="text-gray-600">
            Monitor your Yahoo Finance scraper performance and data
          </p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <motion.div
            animate={{ rotate: refreshing ? 360 : 0 }}
            transition={{ repeat: refreshing ? Infinity : 0, duration: 1 }}
          >
            <RefreshCw size={18} />
          </motion.div>
          <span className="ml-2">Refresh</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Total Companies",
            value: stats.totalCompanies.toLocaleString(),
            icon: "🏢",
            color: "text-blue-600",
          },
          {
            title: "Last Scraped",
            value: formatDate(stats.lastScraped),
            icon: "⏰",
            color: "text-gray-900",
          },
          {
            title: "Scraper Status",
            value: (
              <span className="flex items-center gap-2 text-green-600">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </span>
            ),
            icon: "🔄",
            color: "text-green-600",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              <>
                {stats.recentActivity
                  .slice(0, expanded ? stats.recentActivity.length : 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.symbol}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activity.company}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.scraped_at)}
                      </p>
                    </div>
                  ))}
                {stats.recentActivity.length > 5 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    {expanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MongoDB</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Server</span>
              <span className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Scrape</span>
              <span className="text-sm font-medium text-blue-600">
                {timeLeft ? formatCountdown(timeLeft) : "Pending"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
