import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminService } from '@/services/adminService';
import {
  Activity,
  Database,
  HardDrive,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

export function StatisticsTab() {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['admin-statistics'],
    queryFn: () => adminService.getStatistics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading || !statistics) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  const { system_health, database_stats, api_usage, storage_usage, active_users } = statistics;

  const getHealthBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Healthy
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health */}
      <Card data-tour="system-health-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Real-time system performance metrics</CardDescription>
            </div>
            {getHealthBadge(system_health.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="font-medium">{system_health.cpu_usage_percent}%</span>
              </div>
              <Progress value={system_health.cpu_usage_percent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="font-medium">{system_health.memory_usage_percent}%</span>
              </div>
              <Progress value={system_health.memory_usage_percent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Disk Usage</span>
                <span className="font-medium">{system_health.disk_usage_percent}%</span>
              </div>
              <Progress value={system_health.disk_usage_percent} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">{system_health.uptime_hours.toFixed(1)}h</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last backup: {new Date(system_health.last_backup).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Database Statistics */}
        <Card data-tour="database-stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Statistics
            </CardTitle>
            <CardDescription>Database performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tables</span>
                <span className="text-2xl font-bold">{database_stats.total_tables}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Records</span>
                <span className="text-2xl font-bold">
                  {database_stats.total_records.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Size</span>
                <span className="text-2xl font-bold">{database_stats.database_size_mb} MB</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Connections</span>
                <span className="text-2xl font-bold">{database_stats.connections}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Queries/Second</span>
                <span className="text-2xl font-bold">
                  {database_stats.queries_per_second.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card data-tour="storage-stats-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Usage
            </CardTitle>
            <CardDescription>File storage and usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">
                    {storage_usage.used_storage_gb.toFixed(2)} GB /{' '}
                    {storage_usage.total_storage_gb.toFixed(2)} GB
                  </span>
                </div>
                <Progress
                  value={(storage_usage.used_storage_gb / storage_usage.total_storage_gb) * 100}
                  className="h-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Space</span>
                <span className="text-xl font-bold">
                  {storage_usage.available_storage_gb.toFixed(2)} GB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Files</span>
                <span className="text-xl font-bold">{storage_usage.file_count.toLocaleString()}</span>
              </div>

              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Largest Files</h4>
                <div className="space-y-1">
                  {storage_usage.largest_files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate text-muted-foreground">{file.filename}</span>
                      <span className="ml-2 font-medium">{file.size_mb.toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Usage */}
      <Card data-tour="api-usage-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            API Usage Statistics
          </CardTitle>
          <CardDescription>API request metrics and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Requests Today
              </div>
              <div className="text-3xl font-bold">
                {api_usage.total_requests_today.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Avg Response Time
              </div>
              <div className="text-3xl font-bold">{api_usage.average_response_time_ms} ms</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                Error Rate
              </div>
              <div className="text-3xl font-bold">{api_usage.error_rate_percent.toFixed(2)}%</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-4 text-sm font-medium">Most Used Endpoints</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead className="text-right">Request Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {api_usage.most_used_endpoints.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                      <TableCell className="text-right font-medium">
                        {endpoint.count.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card data-tour="active-users-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Users
          </CardTitle>
          <CardDescription>User activity and distribution by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-3xl font-bold">{active_users.total_users}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Active Today</div>
              <div className="text-3xl font-bold">{active_users.active_users_today}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Active This Week</div>
              <div className="text-3xl font-bold">{active_users.active_users_this_week}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Active This Month</div>
              <div className="text-3xl font-bold">{active_users.active_users_this_month}</div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-4 text-sm font-medium">Users by Role</h4>
            <div className="space-y-3">
              {active_users.by_role.map((role, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{role.role.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(role.count / active_users.total_users) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right font-medium">{role.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
