import React, { useState } from 'react';
import { Badge } from './Badge';

export type TabsProps = {
  tabs: Array<{
    key: string;
    label: string;
    content: React.ReactNode;
    badge?: string | number;
  }>;
  defaultTab?: string;
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key || '');

  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <Badge variant="secondary" size="sm">
                  {tab.badge}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.key === activeTab)?.content}
      </div>
    </div>
  );
};