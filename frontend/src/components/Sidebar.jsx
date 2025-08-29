import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      id: 'companies',
      label: 'Company Profiles',
      icon: '🏢'
    },
    {
      id: 'scraper',
      label: 'Scraper Control',
      icon: '🔄'
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">
          Yahoo Finance Dashboard
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-link w-full text-left ${
              activeTab === item.id ? 'active' : ''
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Scraper runs every 6 hours</p>
          <p className="mt-1">Connected to MongoDB</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;