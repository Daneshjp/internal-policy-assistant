import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminService } from '@/services/adminService';
import type { SystemSettings } from '@/types/admin';
import { Save, Mail } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

export function SystemSettingsTab() {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const { data: fetchedSettings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminService.getSettings(),
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => adminService.updateSettings(data),
    onSuccess: () => {
      showNotification({ type: 'success', title: 'Settings updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to update settings', message: error.message });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => adminService.testEmailSettings({ email }),
    onSuccess: (data) => {
      showNotification({ type: data.success ? 'success' : 'error', title: data.message });
    },
    onError: (error: Error) => {
      showNotification({ type: 'error', title: 'Failed to send test email', message: error.message });
    },
  });

  const handleSaveSettings = () => {
    if (settings) {
      updateSettingsMutation.mutate(settings);
    }
  };

  const handleTestEmail = () => {
    if (testEmail) {
      testEmailMutation.mutate(testEmail);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <Card data-tour="email-settings-card">
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure SMTP settings for email notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  value={settings.email_settings.smtp_host}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: { ...settings.email_settings, smtp_host: e.target.value },
                    })
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  value={settings.email_settings.smtp_port}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtp_port: parseInt(e.target.value),
                      },
                    })
                  }
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input
                  id="smtp-username"
                  value={settings.email_settings.smtp_username}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtp_username: e.target.value,
                      },
                    })
                  }
                  placeholder="username@example.com"
                />
              </div>
              <div>
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={settings.email_settings.smtp_password}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: {
                        ...settings.email_settings,
                        smtp_password: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={settings.email_settings.from_email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: { ...settings.email_settings, from_email: e.target.value },
                    })
                  }
                  placeholder="noreply@example.com"
                />
              </div>
              <div>
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  value={settings.email_settings.from_name}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email_settings: { ...settings.email_settings, from_name: e.target.value },
                    })
                  }
                  placeholder="ADNOC Inspection System"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smtp-tls"
                checked={settings.email_settings.smtp_use_tls}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    email_settings: {
                      ...settings.email_settings,
                      smtp_use_tls: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="smtp-tls">Use TLS</Label>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending || !testEmail}
              >
                <Mail className="mr-2 h-4 w-4" />
                {testEmailMutation.isPending ? 'Sending...' : 'Test Email'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card data-tour="notification-settings-card">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Configure system notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-email"
                checked={settings.notification_preferences.enable_email_notifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      enable_email_notifications: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable-email">Enable Email Notifications</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-reminders"
                checked={settings.notification_preferences.enable_inspection_reminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      enable_inspection_reminders: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable-reminders">Enable Inspection Reminders</Label>
            </div>

            <div>
              <Label htmlFor="reminder-days">Reminder Days Before Inspection</Label>
              <Input
                id="reminder-days"
                type="number"
                value={settings.notification_preferences.reminder_days_before}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      reminder_days_before: parseInt(e.target.value),
                    },
                  })
                }
                min="1"
                max="30"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-overdue"
                checked={settings.notification_preferences.enable_overdue_alerts}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      enable_overdue_alerts: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable-overdue">Enable Overdue Alerts</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-approval"
                checked={settings.notification_preferences.enable_approval_notifications}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notification_preferences: {
                      ...settings.notification_preferences,
                      enable_approval_notifications: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable-approval">Enable Approval Notifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Defaults */}
      <Card data-tour="inspection-defaults-card">
        <CardHeader>
          <CardTitle>Inspection Defaults</CardTitle>
          <CardDescription>Configure default inspection settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="inspection-interval">Default Inspection Interval (Months)</Label>
              <Input
                id="inspection-interval"
                type="number"
                value={settings.inspection_defaults.default_inspection_interval_months}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    inspection_defaults: {
                      ...settings.inspection_defaults,
                      default_inspection_interval_months: parseInt(e.target.value),
                    },
                  })
                }
                min="1"
                max="120"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="require-approval"
                checked={settings.inspection_defaults.require_approval}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    inspection_defaults: {
                      ...settings.inspection_defaults,
                      require_approval: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="require-approval">Require Approval for Inspections</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-assign"
                checked={settings.inspection_defaults.auto_assign_teams}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    inspection_defaults: {
                      ...settings.inspection_defaults,
                      auto_assign_teams: e.target.checked,
                    },
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="auto-assign">Auto-Assign Teams</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Thresholds */}
      <Card data-tour="risk-thresholds-card">
        <CardHeader>
          <CardTitle>Risk Thresholds</CardTitle>
          <CardDescription>Configure RBI risk calculation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="critical-threshold">Critical Risk Threshold</Label>
              <Input
                id="critical-threshold"
                type="number"
                step="0.1"
                value={settings.risk_thresholds.critical_risk_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    risk_thresholds: {
                      ...settings.risk_thresholds,
                      critical_risk_threshold: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="high-threshold">High Risk Threshold</Label>
              <Input
                id="high-threshold"
                type="number"
                step="0.1"
                value={settings.risk_thresholds.high_risk_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    risk_thresholds: {
                      ...settings.risk_thresholds,
                      high_risk_threshold: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="medium-threshold">Medium Risk Threshold</Label>
              <Input
                id="medium-threshold"
                type="number"
                step="0.1"
                value={settings.risk_thresholds.medium_risk_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    risk_thresholds: {
                      ...settings.risk_thresholds,
                      medium_risk_threshold: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="low-threshold">Low Risk Threshold</Label>
              <Input
                id="low-threshold"
                type="number"
                step="0.1"
                value={settings.risk_thresholds.low_risk_threshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    risk_thresholds: {
                      ...settings.risk_thresholds,
                      low_risk_threshold: parseFloat(e.target.value),
                    },
                  })
                }
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="rbi-method">RBI Calculation Method</Label>
              <Input
                id="rbi-method"
                value={settings.risk_thresholds.rbi_calculation_method}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    risk_thresholds: {
                      ...settings.risk_thresholds,
                      rbi_calculation_method: e.target.value,
                    },
                  })
                }
                placeholder="API 581"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Limits */}
      <Card data-tour="file-upload-settings-card">
        <CardHeader>
          <CardTitle>File Upload Limits</CardTitle>
          <CardDescription>Configure file upload restrictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                value={settings.file_upload_limits.max_file_size_mb}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    file_upload_limits: {
                      ...settings.file_upload_limits,
                      max_file_size_mb: parseInt(e.target.value),
                    },
                  })
                }
                min="1"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="max-files">Max Files Per Upload</Label>
              <Input
                id="max-files"
                type="number"
                value={settings.file_upload_limits.max_files_per_upload}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    file_upload_limits: {
                      ...settings.file_upload_limits,
                      max_files_per_upload: parseInt(e.target.value),
                    },
                  })
                }
                min="1"
                max="50"
              />
            </div>

            <div>
              <Label htmlFor="allowed-types">Allowed File Types (comma-separated)</Label>
              <Input
                id="allowed-types"
                value={settings.file_upload_limits.allowed_file_types.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    file_upload_limits: {
                      ...settings.file_upload_limits,
                      allowed_file_types: e.target.value.split(',').map((t) => t.trim()),
                    },
                  })
                }
                placeholder="pdf, jpg, png, doc, xlsx"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Settings */}
      <Card data-tour="session-settings-card">
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
          <CardDescription>Configure user session parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={settings.session_timeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  session_timeout: parseInt(e.target.value),
                })
              }
              min="5"
              max="1440"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              User will be automatically logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          size="lg"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
