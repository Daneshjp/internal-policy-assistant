import { useAuth } from '@/context/AuthContext';
import { Package, ClipboardCheck, FileText, AlertTriangle, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Assets',
      value: '8',
      icon: Package,
      change: '+2.5%',
      changeType: 'positive',
    },
    {
      name: 'Active Inspections',
      value: '0',
      icon: ClipboardCheck,
      change: '0%',
      changeType: 'neutral',
    },
    {
      name: 'Pending Reports',
      value: '0',
      icon: FileText,
      change: '0%',
      changeType: 'neutral',
    },
    {
      name: 'Critical Findings',
      value: '0',
      icon: AlertTriangle,
      change: '0%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome back, <span className="font-medium">{user?.full_name}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === 'positive'
                              ? 'text-green-600'
                              : stat.changeType === 'negative'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="View Assets"
              description="Browse all equipment and assets"
              href="/assets"
              icon={Package}
            />
            <QuickActionCard
              title="My Inspections"
              description="View assigned inspections"
              href="/inspections"
              icon={ClipboardCheck}
            />
            <QuickActionCard
              title="Reports"
              description="Review inspection reports"
              href="/reports"
              icon={FileText}
            />
            {(user?.role === 'team_leader' || user?.role === 'admin') && (
              <>
                <QuickActionCard
                  title="Planning"
                  description="Manage inspection plans"
                  href="/plans/annual"
                  icon={TrendingUp}
                />
                <QuickActionCard
                  title="Teams"
                  description="Manage teams and resources"
                  href="/teams"
                  icon={Users}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-sm text-gray-500">
            No recent activity to display. Start by viewing your assets or creating an inspection plan.
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: any;
}

function QuickActionCard({ title, description, href, icon: Icon }: QuickActionCardProps) {
  return (
    <a
      href={href}
      className="relative group bg-white p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div>
        <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-base font-medium text-gray-900 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      </div>
      <span
        className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-blue-400"
        aria-hidden="true"
      >
        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
        </svg>
      </span>
    </a>
  );
}
