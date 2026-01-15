import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminService } from '@/services/adminService';
import type { AuditLogFilter } from '@/types/admin';
import { Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export function AuditLogTab() {
  const { showNotification } = useNotification();
  const [filter, setFilter] = useState<AuditLogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const itemsPerPage = 50;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', filter, currentPage],
    queryFn: () =>
      adminService.getAuditLogs(
        {
          ...filter,
          search: searchTerm,
          date_from: dateFrom || undefined,
          date_to: dateTo || undefined,
        },
        currentPage,
        itemsPerPage
      ),
  });

  const logs = data?.logs || [];
  const totalLogs = data?.total || 0;
  const totalPages = Math.ceil(totalLogs / itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleExport = async () => {
    try {
      const blob = await adminService.exportAuditLogs({
        ...filter,
        search: searchTerm,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification({ type: 'success', title: 'Audit logs exported successfully' });
    } catch (error) {
      showNotification({ type: 'error', title: 'Failed to export audit logs' });
    }
  };

  const getActionTypeBadge = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'create':
        return <Badge variant="success">Create</Badge>;
      case 'update':
        return <Badge variant="info">Update</Badge>;
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>;
      case 'login':
        return <Badge variant="default">Login</Badge>;
      case 'logout':
        return <Badge variant="secondary">Logout</Badge>;
      case 'export':
        return <Badge variant="warning">Export</Badge>;
      default:
        return <Badge variant="outline">{actionType}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card data-tour="audit-log-card">
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            Track user activity and system changes. Showing {logs.length} of {totalLogs} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-1">
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    data-tour="audit-search-input"
                  />
                  <Button onClick={handleSearch} size="icon" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Action Type</Label>
                <Select
                  value={filter.action_type || 'all'}
                  onValueChange={(value) =>
                    setFilter({ ...filter, action_type: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger data-tour="audit-action-filter">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Resource Type</Label>
                <Select
                  value={filter.resource_type || 'all'}
                  onValueChange={(value) =>
                    setFilter({ ...filter, resource_type: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger data-tour="audit-resource-filter">
                    <SelectValue placeholder="All Resources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="inspection">Inspection</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="date-from">Date From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  data-tour="audit-date-from"
                />
              </div>

              <div>
                <Label htmlFor="date-to">Date To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  data-tour="audit-date-to"
                />
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilter({});
                    setSearchTerm('');
                    setDateFrom('');
                    setDateTo('');
                    setCurrentPage(1);
                  }}
                  className="flex-1"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
                <Button onClick={handleExport} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No audit logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{log.user_name}</TableCell>
                          <TableCell>{getActionTypeBadge(log.action_type)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.resource_type}</Badge>
                            {log.resource_id && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                #{log.resource_id}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md truncate">{log.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.ip_address || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
