import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminService } from '@/services/adminService';
import type { DataExportRequest, DataImportRequest, BackupRequest } from '@/types/admin';
import {
  Download,
  Upload,
  Database,
  Trash2,
  AlertTriangle,
  FileDown,
  Save,
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export function DataManagementTab() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const [exportType, setExportType] = useState<DataExportRequest['export_type']>('all');
  const [exportFormat, setExportFormat] = useState<DataExportRequest['format']>('csv');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');

  const [importType, setImportType] = useState<DataImportRequest['import_type']>('assets');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const [includeFiles, setIncludeFiles] = useState(true);
  const [useCompression, setUseCompression] = useState(true);

  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);

  const { data: retentionSettings, isLoading: isLoadingRetention } = useQuery({
    queryKey: ['retention-settings'],
    queryFn: () => adminService.getRetentionSettings(),
  });

  const [retention, setRetention] = useState(retentionSettings);

  useEffect(() => {
    if (retentionSettings) {
      setRetention(retentionSettings);
    }
  }, [retentionSettings]);

  const exportDataMutation = useMutation({
    mutationFn: (request: DataExportRequest) => adminService.exportData(request),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `${variables.export_type}-export-${timestamp}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification({ type: 'success', title: 'Data exported successfully' });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to export data', message: error.message });
    },
  });

  const importDataMutation = useMutation({
    mutationFn: (request: DataImportRequest) => adminService.importData(request),
    onSuccess: (data) => {
      showNotification({
        type: 'success',
        title: 'Data imported successfully',
        message: `${data.imported_count} records imported`,
      });
      setImportFile(null);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to import data', message: error.message });
    },
  });

  const backupMutation = useMutation({
    mutationFn: (request: BackupRequest) => adminService.createBackup(request),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `backup-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification({ type: 'success', title: 'Backup created successfully' });
      setIsBackupDialogOpen(false);
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to create backup', message: error.message });
    },
  });

  const updateRetentionMutation = useMutation({
    mutationFn: () => {
      if (!retention) throw new Error('Retention settings not loaded');
      return adminService.updateRetentionSettings(retention);
    },
    onSuccess: () => {
      showNotification({ type: 'success', title: 'Retention settings updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['retention-settings'] });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to update retention settings', message: error.message });
    },
  });

  const clearOldDataMutation = useMutation({
    mutationFn: () => adminService.clearOldData(true),
    onSuccess: (data) => {
      showNotification({
        type: 'success',
        title: 'Old data cleared successfully',
        message: `${data.deleted_count} records deleted`,
      });
      setIsClearDataDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-statistics'] });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to clear old data', message: error.message });
    },
  });

  const handleExport = () => {
    exportDataMutation.mutate({
      export_type: exportType,
      format: exportFormat,
      date_from: exportDateFrom || undefined,
      date_to: exportDateTo || undefined,
    });
  };

  const handleImport = () => {
    if (!importFile) {
      showNotification({ type: 'error', title: 'Please select a file to import' });
      return;
    }

    importDataMutation.mutate({
      import_type: importType,
      file: importFile,
      overwrite_existing: overwriteExisting,
    });
  };

  const handleBackup = () => {
    backupMutation.mutate({
      include_files: includeFiles,
      compression: useCompression,
    });
  };

  const handleUpdateRetention = () => {
    updateRetentionMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card data-tour="data-export-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Export system data in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Export Type</Label>
                <Select
                  value={exportType}
                  onValueChange={(value: DataExportRequest['export_type']) =>
                    setExportType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data</SelectItem>
                    <SelectItem value="assets">Assets</SelectItem>
                    <SelectItem value="inspections">Inspections</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="audit_logs">Audit Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Format</Label>
                <Select
                  value={exportFormat}
                  onValueChange={(value: DataExportRequest['format']) => setExportFormat(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="export-date-from">Date From (Optional)</Label>
                <Input
                  id="export-date-from"
                  type="date"
                  value={exportDateFrom}
                  onChange={(e) => setExportDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="export-date-to">Date To (Optional)</Label>
                <Input
                  id="export-date-to"
                  type="date"
                  value={exportDateTo}
                  onChange={(e) => setExportDateTo(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={exportDataMutation.isPending}
              className="w-full"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {exportDataMutation.isPending ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Import */}
      <Card data-tour="data-import-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>Import data from CSV or Excel files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label>Import Type</Label>
              <Select
                value={importType}
                onValueChange={(value: DataImportRequest['import_type']) => setImportType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="import-file">Select File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              {importFile && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="overwrite-existing"
                checked={overwriteExisting}
                onChange={(e) => setOverwriteExisting(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="overwrite-existing">Overwrite existing records</Label>
            </div>

            <Button
              onClick={handleImport}
              disabled={importDataMutation.isPending || !importFile}
              className="w-full"
              variant="secondary"
            >
              <Upload className="mr-2 h-4 w-4" />
              {importDataMutation.isPending ? 'Importing...' : 'Import Data'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card data-tour="database-backup-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup
          </CardTitle>
          <CardDescription>Create a full backup of the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="include-files"
                checked={includeFiles}
                onChange={(e) => setIncludeFiles(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="include-files">Include uploaded files</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use-compression"
                checked={useCompression}
                onChange={(e) => setUseCompression(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="use-compression">Use compression</Label>
            </div>

            <Button
              onClick={() => setIsBackupDialogOpen(true)}
              className="w-full"
              variant="outline"
            >
              <Database className="mr-2 h-4 w-4" />
              Create Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention Settings */}
      <Card data-tour="data-retention-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Data Retention Settings
          </CardTitle>
          <CardDescription>Configure automatic data cleanup policies</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRetention || !retention ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <Label htmlFor="audit-retention">Audit Log Retention (Days)</Label>
                <Input
                  id="audit-retention"
                  type="number"
                  value={retention.audit_log_retention_days}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      audit_log_retention_days: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="3650"
                />
              </div>

              <div>
                <Label htmlFor="inspection-retention">Inspection Data Retention (Years)</Label>
                <Input
                  id="inspection-retention"
                  type="number"
                  value={retention.inspection_data_retention_years}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      inspection_data_retention_years: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="activity-retention">User Activity Retention (Days)</Label>
                <Input
                  id="activity-retention"
                  type="number"
                  value={retention.user_activity_retention_days}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      user_activity_retention_days: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  max="3650"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-delete"
                  checked={retention.auto_delete_old_data}
                  onChange={(e) =>
                    setRetention({
                      ...retention,
                      auto_delete_old_data: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="auto-delete">Automatically delete old data</Label>
              </div>

              <Button
                onClick={handleUpdateRetention}
                disabled={updateRetentionMutation.isPending}
                className="w-full"
              >
                {updateRetentionMutation.isPending ? 'Updating...' : 'Update Retention Settings'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clear Old Data */}
      <Card data-tour="clear-data-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Clear Old Data
          </CardTitle>
          <CardDescription>
            Permanently delete old data based on retention settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800">Warning</h4>
                <p className="mt-1 text-sm text-yellow-700">
                  This action will permanently delete old records based on your retention settings.
                  This cannot be undone. Please ensure you have a recent backup before proceeding.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => setIsClearDataDialogOpen(true)}
            className="mt-4 w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Old Data
          </Button>
        </CardContent>
      </Card>

      {/* Backup Confirmation Dialog */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Database Backup</DialogTitle>
            <DialogDescription>
              This will create a full backup of the database
              {includeFiles && ' and all uploaded files'}. The backup will be downloaded as a ZIP
              file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBackupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBackup} disabled={backupMutation.isPending}>
              {backupMutation.isPending ? 'Creating Backup...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Clear Old Data
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete old data based on your retention
              settings? This action cannot be undone.
              <br />
              <br />
              <strong>Please ensure you have a recent backup before proceeding.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDataDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearOldDataMutation.mutate()}
              disabled={clearOldDataMutation.isPending}
            >
              {clearOldDataMutation.isPending ? 'Deleting...' : 'Delete Old Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
