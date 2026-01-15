# Backend API Requirements for Admin Panel

This document lists all API endpoints required by the Admin Panel frontend.

## Base URL
All endpoints should be prefixed with: `/api/v1`

## Authentication
All admin endpoints require:
- Valid JWT token in Authorization header: `Bearer <token>`
- User role must be `admin`

---

## 1. User Management

### GET /admin/users
List all users with optional filtering.

**Query Parameters:**
- `role` (optional): Filter by role (admin, team_leader, engineer, inspector, rbi_auditor)
- `is_active` (optional): Filter by status (true/false)
- `department` (optional): Filter by department
- `search` (optional): Search by name or email

**Response:**
```json
[
  {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "is_active": true,
    "department": "Engineering",
    "last_login": "2024-01-14T10:30:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-14T10:30:00Z"
  }
]
```

### GET /admin/users/:id
Get single user details.

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "admin",
  "is_active": true,
  "department": "Engineering",
  "last_login": "2024-01-14T10:30:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-14T10:30:00Z"
}
```

### POST /admin/users
Create a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "password": "SecurePassword123!",
  "role": "inspector",
  "department": "Operations",
  "is_active": true
}
```

**Response:** Same as GET /admin/users/:id

### PUT /admin/users/:id
Update user information.

**Request Body:**
```json
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "role": "team_leader",
  "department": "Engineering",
  "is_active": true
}
```

**Response:** Same as GET /admin/users/:id

### DELETE /admin/users/:id
Delete a user (soft delete recommended).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### POST /admin/users/:id/toggle-status
Toggle user active/inactive status.

**Response:**
```json
{
  "id": 1,
  "email": "john@example.com",
  "full_name": "John Doe",
  "role": "admin",
  "is_active": false,
  "department": "Engineering",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-14T10:30:00Z"
}
```

### POST /admin/users/:id/reset-password
Reset user password and generate temporary password.

**Response:**
```json
{
  "message": "Password reset successfully",
  "temporary_password": "TempPass123!"
}
```

---

## 2. System Settings

### GET /admin/settings
Get all system settings.

**Response:**
```json
{
  "email_settings": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "smtp_username": "noreply@example.com",
    "smtp_password": "encrypted_password",
    "smtp_use_tls": true,
    "from_email": "noreply@example.com",
    "from_name": "ADNOC Inspection System"
  },
  "notification_preferences": {
    "enable_email_notifications": true,
    "enable_inspection_reminders": true,
    "reminder_days_before": 7,
    "enable_overdue_alerts": true,
    "enable_approval_notifications": true
  },
  "inspection_defaults": {
    "default_inspection_interval_months": 12,
    "default_inspection_types": ["Visual", "UT", "RT"],
    "require_approval": true,
    "auto_assign_teams": false
  },
  "risk_thresholds": {
    "critical_risk_threshold": 1000,
    "high_risk_threshold": 500,
    "medium_risk_threshold": 100,
    "low_risk_threshold": 10,
    "rbi_calculation_method": "API 581"
  },
  "file_upload_limits": {
    "max_file_size_mb": 50,
    "allowed_file_types": ["pdf", "jpg", "png", "doc", "docx", "xlsx", "csv"],
    "max_files_per_upload": 10
  },
  "session_timeout": 1440
}
```

### PUT /admin/settings
Update system settings (partial update supported).

**Request Body:** Same structure as GET response (can send partial)

**Response:** Complete settings object

### POST /admin/settings/test-email
Send test email to verify SMTP configuration.

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com"
}
```

---

## 3. Audit Logs

### GET /admin/audit-logs
Get audit logs with filtering and pagination.

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 50): Records per page
- `user_id` (optional): Filter by user ID
- `action_type` (optional): Filter by action (create, update, delete, login, logout, export)
- `resource_type` (optional): Filter by resource (user, asset, inspection, report, settings)
- `date_from` (optional): Start date (ISO 8601)
- `date_to` (optional): End date (ISO 8601)
- `search` (optional): Search term

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "user_name": "John Doe",
      "action_type": "create",
      "resource_type": "user",
      "resource_id": 12,
      "description": "Created new user: jane@example.com",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2024-01-14T10:30:00Z",
      "created_at": "2024-01-14T10:30:00Z",
      "updated_at": "2024-01-14T10:30:00Z"
    }
  ],
  "total": 1234
}
```

### GET /admin/audit-logs/export
Export audit logs as CSV.

**Query Parameters:** Same as GET /admin/audit-logs (except page and limit)

**Response:** CSV file download
```
Content-Type: text/csv
Content-Disposition: attachment; filename="audit-logs-2024-01-14.csv"
```

---

## 4. Statistics

### GET /admin/statistics
Get system statistics and metrics.

**Response:**
```json
{
  "system_health": {
    "status": "healthy",
    "uptime_hours": 48.5,
    "cpu_usage_percent": 45.2,
    "memory_usage_percent": 62.8,
    "disk_usage_percent": 38.4,
    "last_backup": "2024-01-14T08:00:00Z"
  },
  "database_stats": {
    "total_tables": 45,
    "total_records": 125432,
    "database_size_mb": 2348,
    "connections": 8,
    "queries_per_second": 125.5
  },
  "api_usage": {
    "total_requests_today": 12456,
    "average_response_time_ms": 145,
    "error_rate_percent": 0.5,
    "most_used_endpoints": [
      { "endpoint": "/api/v1/assets", "count": 2345 },
      { "endpoint": "/api/v1/inspections", "count": 1892 }
    ]
  },
  "storage_usage": {
    "total_storage_gb": 50.0,
    "used_storage_gb": 12.5,
    "available_storage_gb": 37.5,
    "file_count": 1245,
    "largest_files": [
      { "filename": "backup-2024-01-14.zip", "size_mb": 2100.5 },
      { "filename": "export-data.csv", "size_mb": 850.2 }
    ]
  },
  "active_users": {
    "total_users": 45,
    "active_users_today": 32,
    "active_users_this_week": 38,
    "active_users_this_month": 42,
    "by_role": [
      { "role": "admin", "count": 5 },
      { "role": "team_leader", "count": 12 },
      { "role": "engineer", "count": 18 },
      { "role": "inspector", "count": 8 },
      { "role": "rbi_auditor", "count": 2 }
    ]
  }
}
```

**Note:** This endpoint should be optimized for performance. Consider caching results for 30 seconds.

---

## 5. Data Management

### POST /admin/data/export
Export system data.

**Request Body:**
```json
{
  "export_type": "all",
  "format": "csv",
  "date_from": "2024-01-01T00:00:00Z",
  "date_to": "2024-12-31T23:59:59Z"
}
```

**Request Fields:**
- `export_type`: "all" | "assets" | "inspections" | "users" | "audit_logs"
- `format`: "csv" | "excel" | "json"
- `date_from` (optional): Start date
- `date_to` (optional): End date

**Response:** File download
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="all-export-2024-01-14.csv"
```

### POST /admin/data/import
Import data from file.

**Request Body:** multipart/form-data
- `file`: File (CSV or Excel)
- `import_type`: "assets" | "users"
- `overwrite_existing`: boolean

**Response:**
```json
{
  "success": true,
  "message": "Import completed successfully",
  "imported_count": 125
}
```

### POST /admin/data/backup
Create database backup.

**Request Body:**
```json
{
  "include_files": true,
  "compression": true
}
```

**Response:** ZIP file download
```
Content-Type: application/zip
Content-Disposition: attachment; filename="backup-2024-01-14T10-30-00.zip"
```

### GET /admin/data/retention
Get data retention settings.

**Response:**
```json
{
  "audit_log_retention_days": 90,
  "inspection_data_retention_years": 10,
  "user_activity_retention_days": 365,
  "auto_delete_old_data": true
}
```

### PUT /admin/data/retention
Update data retention settings.

**Request Body:** Same as GET response

**Response:** Same as GET response

### POST /admin/data/clear-old
Clear old data based on retention settings.

**Request Body:**
```json
{
  "confirm": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Old data cleared successfully",
  "deleted_count": 1523
}
```

---

## Error Responses

All endpoints should return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Validation error: email is required",
  "details": {
    "field": "email",
    "constraint": "required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Admin role required"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "User with ID 123 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "request_id": "abc-123-def"
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Only users with `admin` role can access
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Input Validation**: Validate all input data
5. **SQL Injection**: Use parameterized queries
6. **Password Security**: Hash passwords with bcrypt (min 12 rounds)
7. **Audit Logging**: Log all admin actions
8. **File Upload**: Validate file types and sizes
9. **CORS**: Configure appropriate CORS headers
10. **HTTPS**: Enforce HTTPS in production

---

## Performance Considerations

1. **Statistics Endpoint**: Cache for 30 seconds
2. **Pagination**: Default limit of 50, max 100
3. **Export/Backup**: Generate files asynchronously for large datasets
4. **Database Queries**: Use indexes on frequently queried fields
5. **File Operations**: Stream large files instead of loading into memory

---

## Testing Checklist

### User Management
- [ ] List users with all filter combinations
- [ ] Create user with all roles
- [ ] Update user information
- [ ] Toggle user status
- [ ] Reset password (verify temporary password)
- [ ] Delete user
- [ ] Search users

### System Settings
- [ ] Get all settings
- [ ] Update settings (partial and full)
- [ ] Test email sending

### Audit Logs
- [ ] List logs with pagination
- [ ] Filter by action type
- [ ] Filter by resource type
- [ ] Filter by date range
- [ ] Search logs
- [ ] Export logs to CSV

### Statistics
- [ ] Get all statistics
- [ ] Verify metrics accuracy
- [ ] Check performance (< 1 second response time)

### Data Management
- [ ] Export all data types in all formats
- [ ] Import assets and users
- [ ] Create backup with all options
- [ ] Get/update retention settings
- [ ] Clear old data

---

## Mock Data for Development

If backend is not ready, the frontend can use mock data. Example mock responses are provided in the frontend documentation.

---

## API Documentation

Consider using:
- **Swagger/OpenAPI**: Auto-generate API documentation
- **Postman Collection**: Share collection with frontend team
- **API Versioning**: Use `/api/v1/` prefix for future compatibility

---

## Contact

For questions or clarifications about these API requirements, contact the frontend team.
