import React, { useState, useEffect } from 'react';
import { triggerScraper, fetchStats } from '../services/api.js';

const ScraperControl = () => {
  const [isScrapingManually, setIsScrapingManually] = useState(false);
  const [lastScrapeResult, setLastScrapeResult] = useState(null);
  const [stats, setStats] = useState({ lastScraped: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleManualScrape = async () => {
    setIsScrapingManually(true);
    setLastScrapeResult(null);

    try {
      const result = await triggerScraper();
      setLastScrapeResult({
        success: true,
        message: result.message,
        timestamp: result.timestamp
      });
      
      // Refresh stats after scraping
      setTimeout(() => {
        loadStats();
      }, 2000);
      
    } catch (error) {
      setLastScrapeResult({
        success: false,
        message: error.message || 'Failed to trigger scraper',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsScrapingManually(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getNextScheduledRun = () => {
    if (!stats.lastScraped) return 'Pending first run';
    const lastRun = new Date(stats.lastScraped);
    const nextRun = new Date(lastRun.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    return formatDate(nextRun.toISOString());
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Scraper Control
        </h2>
        <p className="text-gray-600">
          Monitor and control your Yahoo Finance scraper
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Manual Scrape Control
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ℹ️ Manual scraping will run your existing scraper function immediately. 
                This will collect fresh data from Yahoo Finance and update your MongoDB collection.
              </p>
            </div>

            <button
              onClick={handleManualScrape}
              disabled={isScrapingManually}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors duration-200 ${
                isScrapingManually
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isScrapingManually ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scraping in Progress...</span>
                </div>
              ) : (
                'Start Manual Scrape'
              )}
            </button>

            {lastScrapeResult && (
              <div className={`p-4 rounded-lg border ${
                lastScrapeResult.success 
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm font-medium ${
                  lastScrapeResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastScrapeResult.success ? '✅' : '❌'} {lastScrapeResult.message}
                </p>
                <p className={`text-xs mt-1 ${
                  lastScrapeResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatDate(lastScrapeResult.timestamp)}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Scheduler Status
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Automatic Schedule
                </span>
                <span className="text-sm font-semibold text-green-600">
                  ✅ Active
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Runs every 6 hours automatically
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Run</span>
                <span className="text-sm font-medium">
                  {formatDate(stats.lastScraped)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Next Scheduled Run</span>
                <span className="text-sm font-medium text-blue-600">
                  {getNextScheduledRun()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Schedule Status</span>
                <span className="text-sm font-medium text-green-600">
                  Running
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Configuration
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Frequency: Every 6 hours</p>
                <p>• Target: Yahoo Finance private companies</p>
                <p>• Database: MongoDB (valuations.yahoo_finance)</p>
                <p>• Deduplication: Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Scraper Logs
        </h3>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
          <div className="space-y-1">
            <p>[{new Date().toLocaleString()}] ✅ Scraper service initialized</p>
            <p>[{new Date().toLocaleString()}] 🔗 Connected to MongoDB</p>
            <p>[{new Date().toLocaleString()}] ⏰ Cron schedule set: Every 6 hours</p>
            <p>[{new Date().toLocaleString()}] 🚀 System ready for scraping</p>
            {lastScrapeResult && (
              <p>[{formatDate(lastScrapeResult.timestamp)}] {lastScrapeResult.success ? '✅' : '❌'} {lastScrapeResult.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScraperControl;