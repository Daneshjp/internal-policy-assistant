# Inspections Module - Backend API Requirements

## Overview
This document outlines the backend API endpoints required to support the Inspections module frontend implementation.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require JWT authentication via Bearer token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. List Inspections
**GET** `/inspections`

**Description**: Retrieve paginated list of inspections with optional filters

**Query Parameters**:
```typescript
{
  status?: string;              // Filter by status: not_started, in_progress, completed, on_hold, cancelled
  asset_id?: number;            // Filter by asset ID
  inspector_id?: number;        // Filter by inspector ID (usually current user)
  inspection_type?: string;     // Filter by type: routine, statutory, rbi, shutdown, emergency
  date_from?: string;           // Filter by date range (ISO format)
  date_to?: string;             // Filter by date range (ISO format)
  search?: string;              // Search asset name/number
  page?: number;                // Page number (default: 1)
  page_size?: number;           // Items per page (default: 12)
}
```

**Response** (200):
```typescript
{
  items: Inspection[];
  total: number;
  page: number;
  page_size: number;
}
```

**Inspection Object**:
```typescript
{
  id: number;
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: 'routine' | 'statutory' | 'rbi' | 'shutdown' | 'emergency';
  inspection_date: string;      // ISO datetime
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  primary_inspector_id: number;
  secondary_inspector_ids?: number[];
  actual_start_time?: string;   // ISO datetime
  actual_end_time?: string;     // ISO datetime
  weather_conditions?: string;
  inspection_notes?: string;
  created_at: string;           // ISO datetime
  updated_at: string;           // ISO datetime

  // Expanded relations (optional but recommended)
  asset?: {
    asset_name: string;
    asset_number: string;
    location: string;
  };
  primary_inspector?: {
    full_name: string;
    email: string;
  };
  findings_count?: number;
}
```

---

### 2. Get Inspection Details
**GET** `/inspections/{id}`

**Description**: Retrieve detailed information for a single inspection

**Path Parameters**:
- `id` (number): Inspection ID

**Response** (200):
```typescript
{
  id: number;
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: string;
  inspection_date: string;
  status: string;
  primary_inspector_id: number;
  secondary_inspector_ids?: number[];
  actual_start_time?: string;
  actual_end_time?: string;
  weather_conditions?: string;
  inspection_notes?: string;
  created_at: string;
  updated_at: string;

  // Expanded relations (required for detail view)
  asset: {
    asset_name: string;
    asset_number: string;
    location: string;
  };
  primary_inspector: {
    full_name: string;
    email: string;
  };
}
```

**Error Responses**:
- 404: Inspection not found
- 401: Unauthorized
- 403: Forbidden (not assigned to user)

---

### 3. Start Inspection
**POST** `/inspections/{id}/start`

**Description**: Mark an inspection as started, set actual_start_time

**Path Parameters**:
- `id` (number): Inspection ID

**Request Body**: None (empty)

**Response** (200):
```typescript
{
  // Updated inspection object with:
  status: 'in_progress',
  actual_start_time: string  // Current timestamp
}
```

**Business Logic**:
- Only inspections with status `not_started` can be started
- Set `actual_start_time` to current timestamp
- Update `status` to `in_progress`
- Only assigned inspector can start

**Error Responses**:
- 400: Inspection already started/completed
- 404: Inspection not found
- 403: User not assigned as inspector

---

### 4. Complete Inspection
**POST** `/inspections/{id}/complete`

**Description**: Mark an inspection as completed, set actual_end_time

**Path Parameters**:
- `id` (number): Inspection ID

**Request Body**: None (empty)

**Response** (200):
```typescript
{
  // Updated inspection object with:
  status: 'completed',
  actual_end_time: string  // Current timestamp
}
```

**Business Logic**:
- Only inspections with status `in_progress` can be completed
- Set `actual_end_time` to current timestamp
- Update `status` to `completed`
- Only assigned inspector can complete

**Error Responses**:
- 400: Inspection not in progress
- 404: Inspection not found
- 403: User not assigned as inspector

---

### 5. Get Inspection Findings
**GET** `/inspections/{id}/findings`

**Description**: Retrieve all findings for an inspection

**Path Parameters**:
- `id` (number): Inspection ID

**Response** (200):
```typescript
InspectionFinding[]
```

**InspectionFinding Object**:
```typescript
{
  id: number;
  inspection_id: number;
  finding_type: 'defect' | 'observation' | 'recommendation' | 'ok';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location_on_asset: string;
  photos: string[];                     // Array of photo URLs
  measurements?: Record<string, any>;   // Optional measurements
  corrective_action_required: boolean;
  corrective_action_description?: string;
  corrective_action_deadline?: string;  // ISO date
  created_at: string;
  updated_at: string;
}
```

---

### 6. Add Finding
**POST** `/inspections/{id}/findings`

**Description**: Add a new finding to an inspection

**Path Parameters**:
- `id` (number): Inspection ID

**Request Body**:
```typescript
{
  finding_type: 'defect' | 'observation' | 'recommendation' | 'ok';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location_on_asset: string;
  photos: string[];                     // Array of photo URLs (from separate upload)
  measurements?: Record<string, any>;
  corrective_action_required: boolean;
  corrective_action_description?: string;
  corrective_action_deadline?: string;
}
```

**Response** (201):
```typescript
{
  // Created finding object with generated id, timestamps
}
```

**Validation**:
- `description`: Required, min length 10
- `location_on_asset`: Required, min length 3
- `corrective_action_description`: Required if `corrective_action_required` is true

**Error Responses**:
- 400: Validation error
- 404: Inspection not found
- 403: Inspection not in progress or user not assigned

---

### 7. Upload Photos
**POST** `/inspections/{id}/photos`

**Description**: Upload photos for an inspection (used before adding finding)

**Path Parameters**:
- `id` (number): Inspection ID

**Request Body** (multipart/form-data):
```
files: File[]  // Multiple files
```

**Request Headers**:
```
Content-Type: multipart/form-data
```

**Response** (200):
```typescript
{
  urls: string[]  // Array of uploaded photo URLs
}
```

**File Constraints**:
- Accepted formats: JPEG, PNG, HEIC
- Max file size: 10MB per file
- Max files per upload: 10

**Storage**:
- Store in cloud storage (S3, Azure Blob, etc.)
- Return publicly accessible URLs or signed URLs
- Associate with inspection for later cleanup

**Error Responses**:
- 400: Invalid file format or size
- 404: Inspection not found
- 413: Payload too large

---

## Additional Endpoints (Optional but Recommended)

### 8. Update Inspection
**PUT** `/inspections/{id}`

**Description**: Update inspection details (notes, weather, etc.)

**Request Body**:
```typescript
{
  inspection_notes?: string;
  weather_conditions?: string;
  secondary_inspector_ids?: number[];
}
```

---

### 9. Delete Finding
**DELETE** `/inspections/{inspection_id}/findings/{finding_id}`

**Description**: Delete a finding (only if inspection not completed)

---

### 10. Update Finding
**PUT** `/inspections/{inspection_id}/findings/{finding_id}`

**Description**: Update a finding (only if inspection not completed)

---

## Data Models (Backend Reference)

### Inspection Model
```python
class Inspection(Base):
    __tablename__ = "inspections"

    id: int
    planned_inspection_id: int
    asset_id: int
    inspection_type: str
    inspection_date: datetime
    status: str
    primary_inspector_id: int
    secondary_inspector_ids: List[int]
    actual_start_time: Optional[datetime]
    actual_end_time: Optional[datetime]
    weather_conditions: Optional[str]
    inspection_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Relationships
    asset: Asset
    primary_inspector: User
    findings: List[InspectionFinding]
```

### InspectionFinding Model
```python
class InspectionFinding(Base):
    __tablename__ = "inspection_findings"

    id: int
    inspection_id: int
    finding_type: str
    severity: str
    description: str
    location_on_asset: str
    photos: List[str]
    measurements: Optional[Dict]
    corrective_action_required: bool
    corrective_action_description: Optional[str]
    corrective_action_deadline: Optional[date]
    created_at: datetime
    updated_at: datetime

    # Relationships
    inspection: Inspection
```

---

## Security Considerations

1. **Authorization**:
   - Inspectors can only view/modify their assigned inspections
   - Team leaders can view all inspections in their department
   - Admins have full access

2. **File Upload**:
   - Validate file types and sizes
   - Scan for malware
   - Use signed URLs for access control
   - Implement rate limiting

3. **Data Validation**:
   - Validate all input fields
   - Sanitize strings to prevent XSS
   - Use parameterized queries to prevent SQL injection
   - Enforce business rules (e.g., can't complete without starting)

4. **Rate Limiting**:
   - Photo uploads: 10 requests per minute
   - API calls: 100 requests per minute per user

---

## Error Response Format

All errors should follow this format:
```typescript
{
  detail: string;        // Human-readable error message
  error_code?: string;   // Optional machine-readable code
}
```

**Example**:
```json
{
  "detail": "Inspection must be in progress to add findings",
  "error_code": "INSPECTION_NOT_IN_PROGRESS"
}
```

---

## Testing Endpoints

Use these sample requests for testing:

### Start Inspection
```bash
curl -X POST http://localhost:8000/api/v1/inspections/1/start \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Add Finding
```bash
curl -X POST http://localhost:8000/api/v1/inspections/1/findings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "finding_type": "defect",
    "severity": "high",
    "description": "Corrosion detected on north face",
    "location_on_asset": "North face, 3m from top",
    "photos": ["https://example.com/photo1.jpg"],
    "corrective_action_required": true,
    "corrective_action_description": "Replace affected section",
    "corrective_action_deadline": "2026-02-01"
  }'
```

### Upload Photos
```bash
curl -X POST http://localhost:8000/api/v1/inspections/1/photos \
  -H "Authorization: Bearer <token>" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg"
```

---

## Database Migrations

Ensure the following database tables exist:
- `inspections`
- `inspection_findings`
- `assets` (with relationships)
- `users` (with relationships)

Run migrations before testing the frontend.
