import React, { useState, useEffect } from 'react';
import CompaniesTable from './CompaniesTable.jsx';
import Charts from './Charts.jsx';
import { fetchCompanies } from '../services/api.js';

const CompanyProfiles = () => {
  const [activeTab, setActiveTab] = useState('private');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'private') {
      loadCompanies();
    } else {
      // Mock data for public companies
      setCompanies([
        {
          Symbol: 'AAPL',
          Company: 'Apple Inc.',
          Sector: 'Technology',
          Industry: 'Consumer Electronics',
          Valuation: 3000000000000,
          Employees: 164000,
          scraped_at: new Date().toISOString()
        },
        {
          Symbol: 'MSFT',
          Company: 'Microsoft Corporation',
          Sector: 'Technology',
          Industry: 'Software',
          Valuation: 2800000000000,
          Employees: 221000,
          scraped_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
      setError(null);
    }
  }, [activeTab]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanies();
      setCompanies(data);
      setError(null);
    } catch (err) {
      setError('Failed to load companies');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Company Profiles
        </h2>
        <p className="text-gray-600">
          Browse and analyze company data from various sources
        </p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('private')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'private'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Private Companies
              {!loading && activeTab === 'private' && (
                <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                  {companies.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Public Companies
              {!loading && activeTab === 'public' && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {companies.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadCompanies}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CompaniesTable 
            companies={companies} 
            loading={loading}
            isPublic={activeTab === 'public'}
          />
        </div>
        <div>
          <Charts companies={companies} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default CompanyProfiles;