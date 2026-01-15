# Admin Panel

Complete administrative interface for the ADNOC Inspection Agent application.

## Structure

```
admin/
├── AdminPage.tsx                          # Main admin panel with tabs
├── components/
│   ├── UserManagementTab.tsx             # User CRUD, roles, permissions
│   ├── SystemSettingsTab.tsx             # Email, notifications, inspection defaults
│   ├── AuditLogTab.tsx                   # Activity logs, exports
│   ├── StatisticsTab.tsx                 # System health, database, API stats
│   └── DataManagementTab.tsx             # Export, import, backup, retention
└── README.md                              # This file
```

## Features

### 1. User Management
- List all users with filtering and search
- Create new users with role assignment
- Edit user information (name, email, role, department)
- Activate/deactivate users
- Reset user passwords (generates temporary password)
- Delete users (with confirmation)
- Role-based badges and status indicators

### 2. System Settings
- **Email Settings**: SMTP configuration with test email functionality
- **Notification Preferences**: Enable/disable various notification types
- **Inspection Defaults**: Default intervals, types, approval requirements
- **Risk Thresholds**: RBI calculation parameters
- **File Upload Limits**: Size limits, allowed file types
- **Session Settings**: Session timeout configuration

### 3. Audit Log
- View all user activities and system changes
- Filter by:
  - Action type (create, update, delete, login, etc.)
  - Resource type (user, asset, inspection, etc.)
  - Date range
  - Search term
- Export audit logs to CSV
- Pagination support (50 records per page)

### 4. Statistics
- **System Health**: CPU, memory, disk usage, uptime
- **Database Stats**: Tables, records, size, connections, queries/sec
- **API Usage**: Request count, response time, error rate, popular endpoints
- **Storage Usage**: Total/used/available space, file count, largest files
- **Active Users**: Total, daily, weekly, monthly activity, distribution by role

### 5. Data Management
- **Export Data**: Export all data or specific types (assets, inspections, users) in CSV/Excel/JSON
- **Import Data**: Import assets or users from CSV/Excel files
- **Database Backup**: Create full database backup with optional file inclusion and compression
- **Data Retention**: Configure automatic data cleanup policies
- **Clear Old Data**: Manually delete old records based on retention settings

## Access Control

The admin panel is restricted to users with the `admin` role only.

## API Endpoints Required

The admin panel expects the following backend endpoints:

### User Management
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/:id` - Get user details
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `POST /api/v1/admin/users/:id/toggle-status` - Activate/deactivate user
- `POST /api/v1/admin/users/:id/reset-password` - Reset password

### System Settings
- `GET /api/v1/admin/settings` - Get settings
- `PUT /api/v1/admin/settings` - Update settings
- `POST /api/v1/admin/settings/test-email` - Send test email

### Audit Logs
- `GET /api/v1/admin/audit-logs` - List audit logs
- `GET /api/v1/admin/audit-logs/export` - Export audit logs

### Statistics
- `GET /api/v1/admin/statistics` - Get system statistics

### Data Management
- `POST /api/v1/admin/data/export` - Export data
- `POST /api/v1/admin/data/import` - Import data
- `POST /api/v1/admin/data/backup` - Create backup
- `GET /api/v1/admin/data/retention` - Get retention settings
- `PUT /api/v1/admin/data/retention` - Update retention settings
- `POST /api/v1/admin/data/clear-old` - Clear old data

## Data Tour Attributes

The admin panel includes data-tour attributes for guided tours:
- `data-tour="admin-panel"` - Main admin panel
- `data-tour="admin-users-tab"` - User management tab
- `data-tour="admin-settings-tab"` - System settings tab
- `data-tour="admin-audit-tab"` - Audit log tab
- `data-tour="admin-stats-tab"` - Statistics tab
- `data-tour="admin-data-tab"` - Data management tab
- And more specific attributes for individual components

## Mobile Responsive

All tabs and components are fully responsive:
- Tabs collapse to icons on small screens
- Tables scroll horizontally on mobile
- Forms stack vertically on mobile
- Dialogs adapt to screen size

## Production Ready

- TypeScript type safety throughout
- Proper error handling and user feedback
- Loading states for all async operations
- Confirmation dialogs for destructive actions
- Form validation
- Optimistic updates where appropriate
- Proper query invalidation and cache management
