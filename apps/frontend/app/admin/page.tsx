'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '../../contexts/auth/AuthContext';

interface DashboardStats {
  products: number;
  categories: number;
  inquiries: number;
  users: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    categories: 0,
    inquiries: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        products: 42,
        categories: 12,
        inquiries: 8,
        users: 5,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products, color: 'bg-blue-500', icon: '📦' },
    { label: 'Categories', value: stats.categories, color: 'bg-green-500', icon: '📂' },
    { label: 'Pending Inquiries', value: stats.inquiries, color: 'bg-yellow-500', icon: '✉️' },
    { label: 'Users', value: stats.users, color: 'bg-purple-500', icon: '👥' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Here&apos;s what&apos;s happening with your site.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                      <dd className="text-3xl font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: 'New product added', time: '2 hours ago' },
                { action: 'Inquiry received', time: '5 hours ago' },
                { action: 'Category updated', time: '1 day ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{activity.action}</span>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                <span className="text-sm font-medium text-blue-900">Add New Product</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                <span className="text-sm font-medium text-green-900">View Inquiries</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                <span className="text-sm font-medium text-purple-900">Manage Users</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
