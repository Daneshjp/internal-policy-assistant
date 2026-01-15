# Admin Panel Features Guide

## Tab Navigation

The admin panel features a clean, tabbed interface with 5 main sections:

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Panel                                                 │
│  System administration and configuration                     │
├─────────────────────────────────────────────────────────────┤
│  [Users] [Settings] [Audit Log] [Statistics] [Data]         │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. User Management Tab

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  User Management                                             │
│  Manage system users, roles, and permissions                │
├─────────────────────────────────────────────────────────────┤
│  [Search...] [Role Filter] [Status Filter] [+ Create User]  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name    │ Email    │ Role    │ Status │ Actions    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ John Doe│ john@... │ ADMIN   │ ✓ Active│[✏️][🔑][⚡][🗑️]│   │
│  │ Jane    │ jane@... │ ENGINEER│ ✓ Active│[✏️][🔑][⚡][🗑️]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **Search**: Real-time search by name or email
- **Filters**: Filter by role (admin, team_leader, engineer, inspector, rbi_auditor) and status (active/inactive)
- **Create User**: Full form with email, name, password, role, department
- **Edit**: Modify user details (except password)
- **Reset Password**: Generates temporary password displayed in dialog
- **Toggle Status**: Activate/deactivate users
- **Delete**: With confirmation dialog
- **Role Badges**: Color-coded badges for each role
  - Admin: Red
  - Team Leader: Blue
  - Engineer: Gray
  - Inspector: Outlined
  - RBI Auditor: Blue/Info

---

## 2. System Settings Tab

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  System Settings                                             │
│                                                              │
│  ┌─ Email Settings ──────────────────────────────────────┐  │
│  │ SMTP Host: [smtp.gmail.com]    Port: [587]           │  │
│  │ Username: [user@example.com]    Password: [••••••]   │  │
│  │ From Email: [noreply@...]       From Name: [ADNOC]   │  │
│  │ ☑ Use TLS                                             │  │
│  │ Test Email: [test@example.com] [Send Test Email]     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Notification Preferences ────────────────────────────┐  │
│  │ ☑ Enable Email Notifications                         │  │
│  │ ☑ Enable Inspection Reminders                        │  │
│  │ Reminder Days Before: [7]                            │  │
│  │ ☑ Enable Overdue Alerts                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Inspection Defaults ──────────────────────────────────┐  │
│  │ Default Interval (Months): [12]                       │  │
│  │ ☑ Require Approval                                    │  │
│  │ ☑ Auto-Assign Teams                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [Save All Settings]                                         │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **Email Configuration**: Complete SMTP setup with test functionality
- **Notification Settings**: Toggle various notification types
- **Inspection Defaults**: Configure default inspection parameters
- **Risk Thresholds**: Set RBI calculation thresholds (Critical, High, Medium, Low)
- **File Upload Limits**: Max size, file types, files per upload
- **Session Timeout**: Configure auto-logout period
- **Test Email**: Send test email to verify configuration

---

## 3. Audit Log Tab

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Audit Log                                                   │
│  Track user activity and system changes                      │
├─────────────────────────────────────────────────────────────┤
│  [Search...] [Action▼] [Resource▼] [From] [To] [Export CSV] │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Time        │ User  │ Action │ Resource │ Details    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2024-01-14  │ Admin │ CREATE │ USER #12 │ Created... │   │
│  │ 2024-01-14  │ Jane  │ UPDATE │ ASSET#45 │ Modified...│   │
│  │ 2024-01-14  │ John  │ LOGIN  │ -        │ Logged in  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Page 1 of 10        [← Previous] [Next →]                  │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **Search**: Search across all fields
- **Action Filter**: create, update, delete, login, logout, export
- **Resource Filter**: user, asset, inspection, report, settings
- **Date Range**: Filter by date range
- **Export**: Download filtered logs as CSV
- **Pagination**: 50 records per page with navigation
- **Color-Coded Actions**:
  - Create: Green
  - Update: Blue
  - Delete: Red
  - Login: Default
  - Logout: Gray
  - Export: Yellow

---

## 4. Statistics Tab

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  System Health                          [✓ Healthy]          │
│  ┌─────────┬─────────┬─────────┬─────────────────────┐     │
│  │ CPU 45% │ MEM 62% │ DISK 38%│ Uptime: 48.5h       │     │
│  │ ████    │ ████    │ ███     │ Last backup: 2h ago │     │
│  └─────────┴─────────┴─────────┴─────────────────────┘     │
│                                                              │
│  ┌─ Database Statistics ───┐  ┌─ Storage Usage ────────┐   │
│  │ Tables:        45        │  │ Used: 12.5 GB / 50 GB │   │
│  │ Records:   125,432       │  │ Available: 37.5 GB    │   │
│  │ Size:      2,348 MB      │  │ ████████░░░░          │   │
│  │ Connections:   8         │  │ Files: 1,245          │   │
│  │ Queries/sec:   125.5     │  │ Largest Files:        │   │
│  └──────────────────────────┘  │ - backup.zip (2.1GB)  │   │
│                                 │ - data.csv (850MB)    │   │
│  ┌─ API Usage ─────────────────────────────────────────┐   │
│  │ Requests Today: 12,456  Avg Response: 145ms         │   │
│  │ Error Rate: 0.5%                                    │   │
│  │                                                      │   │
│  │ Most Used Endpoints:                                │   │
│  │ /api/v1/assets          2,345 requests             │   │
│  │ /api/v1/inspections     1,892 requests             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Active Users ──────────────────────────────────────┐   │
│  │ Total: 45  Today: 32  This Week: 38  This Month: 42 │   │
│  │ By Role:                                             │   │
│  │ ADMIN          ████ 5                                │   │
│  │ TEAM_LEADER    ████████ 12                           │   │
│  │ ENGINEER       ████████████ 18                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **System Health**: Real-time CPU, memory, disk usage with progress bars
- **Database Stats**: Tables, records, size, connections, query performance
- **API Usage**: Request counts, response times, error rates, endpoint analytics
- **Storage**: Space usage with largest files breakdown
- **Active Users**: Activity metrics and role distribution
- **Auto-Refresh**: Updates every 30 seconds
- **Visual Indicators**: Progress bars, color-coded status badges

---

## 5. Data Management Tab

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Data Management                                             │
│                                                              │
│  ┌─ Export Data ─────────────────────────────────────────┐  │
│  │ Type: [All Data ▼]        Format: [CSV ▼]            │  │
│  │ Date From: [2024-01-01]   Date To: [2024-12-31]      │  │
│  │ [Export Data]                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Import Data ─────────────────────────────────────────┐  │
│  │ Type: [Assets ▼]                                      │  │
│  │ File: [Choose File] data.csv (125 KB)                │  │
│  │ ☑ Overwrite existing records                         │  │
│  │ [Import Data]                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Database Backup ─────────────────────────────────────┐  │
│  │ ☑ Include uploaded files                             │  │
│  │ ☑ Use compression                                     │  │
│  │ [Create Backup]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ Data Retention Settings ─────────────────────────────┐  │
│  │ Audit Log Retention (Days): [90]                     │  │
│  │ Inspection Data Retention (Years): [10]              │  │
│  │ User Activity Retention (Days): [365]                │  │
│  │ ☑ Automatically delete old data                      │  │
│  │ [Update Settings]                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ ⚠️ Clear Old Data ───────────────────────────────────┐  │
│  │ WARNING: This will permanently delete old records     │  │
│  │ based on retention settings. Cannot be undone.        │  │
│  │ [Clear Old Data]                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Features
- **Export Options**:
  - Types: All, Assets, Inspections, Users, Audit Logs
  - Formats: CSV, Excel, JSON
  - Optional date range filtering
  - Automatic download with timestamped filename

- **Import**:
  - Types: Assets, Users
  - File formats: CSV, Excel (.xlsx, .xls)
  - Optional overwrite existing records
  - Import count feedback

- **Backup**:
  - Full database backup
  - Optional file inclusion
  - Compression option
  - Downloads as ZIP file with timestamp

- **Retention**:
  - Configurable retention periods for different data types
  - Automatic deletion toggle
  - Separate settings for audit logs, inspections, user activity

- **Clear Data**:
  - Manually trigger old data deletion
  - Warning dialog with confirmation
  - Shows count of deleted records

---

## Mobile Responsiveness

### Desktop (1024px+)
- Full layout with all columns visible
- Horizontal tab navigation with text labels
- Side-by-side cards

### Tablet (768px - 1023px)
- Adjusted grid layouts (2 columns instead of 3)
- Tables scroll horizontally
- Tabs show text labels

### Mobile (< 768px)
- Single column layout
- Tabs show icons only with tooltips
- Tables scroll horizontally
- Forms stack vertically
- Dialogs take full width
- Filters collapse into dropdowns

---

## Keyboard Shortcuts

- **Tab Navigation**: Arrow keys to switch tabs
- **Search**: Enter key to trigger search
- **Dialogs**: Escape to close
- **Forms**: Tab to navigate fields
- **Tables**: Tab to navigate rows

---

## Color Coding

### Status Badges
- **Success/Active**: Green
- **Warning**: Yellow
- **Error/Critical**: Red
- **Info**: Blue
- **Secondary**: Gray
- **Destructive**: Dark Red

### Role Badges
- **Admin**: Red (destructive)
- **Team Leader**: Blue (default)
- **Engineer**: Gray (secondary)
- **Inspector**: Outlined
- **RBI Auditor**: Blue (info)

### Action Types
- **Create**: Green badge
- **Update**: Blue badge
- **Delete**: Red badge
- **Login**: Default badge
- **Logout**: Gray badge
- **Export**: Yellow badge

---

## Loading States

All async operations show loading indicators:
- **Button States**: "Creating...", "Updating...", "Deleting...", etc.
- **Page Loading**: Centered spinner with animation
- **Tables**: Loading spinner in table center
- **Forms**: Disabled inputs during submission

---

## Error Handling

All errors display user-friendly notifications:
- **Success**: Green notification with checkmark
- **Error**: Red notification with error icon
- **Warning**: Yellow notification with warning icon
- **Info**: Blue notification with info icon

Notifications auto-dismiss after 5 seconds or can be manually closed.

---

## Confirmation Dialogs

Destructive actions require confirmation:
- **Delete User**: "Are you sure you want to delete [name]?"
- **Clear Data**: Warning about permanent deletion with backup reminder
- **Reset Password**: Shows generated temporary password
- **Create Backup**: Confirms inclusion of files and compression

All dialogs have:
- Clear title and description
- Cancel button (gray, outlined)
- Confirm button (appropriate color based on action)
- Escape key to cancel
- Click outside to cancel
