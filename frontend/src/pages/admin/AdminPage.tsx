import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserManagementTab } from './components/UserManagementTab';
import { SystemSettingsTab } from './components/SystemSettingsTab';
import { AuditLogTab } from './components/AuditLogTab';
import { StatisticsTab } from './components/StatisticsTab';
import { DataManagementTab } from './components/DataManagementTab';
import {
  Users,
  Settings,
  FileText,
  BarChart3,
  Database
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="space-y-6" data-tour="admin-panel">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="mt-2 text-sm text-gray-700">
          System administration and configuration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="users" className="flex items-center gap-2" data-tour="admin-users-tab">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" data-tour="admin-settings-tab">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2" data-tour="admin-audit-tab">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2" data-tour="admin-stats-tab">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2" data-tour="admin-data-tab">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SystemSettingsTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditLogTab />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <StatisticsTab />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
