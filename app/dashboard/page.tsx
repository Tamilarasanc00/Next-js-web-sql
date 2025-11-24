'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/Dashboard/StatsCard';

interface DashboardData {
  totalUsers: number;
  totalPoints: number;
  totalProducts: number;
  recentActivity: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <StatsCard
            title="Total Users"
            value={data?.totalUsers || 0}
            description="Registered users"
          />
          <StatsCard
            title="Total Points"
            value={data?.totalPoints || 0}
            description="Points distributed"
          />
          <StatsCard
            title="Active Products"
            value={data?.totalProducts || 0}
            description="Available SKUs"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {/* Activity list would go here */}
            <div className="p-4 text-center text-gray-500">
              Recent activity will appear here
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}