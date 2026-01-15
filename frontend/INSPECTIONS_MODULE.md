# Inspections Module Documentation

## Overview
Complete, production-ready Inspections module for the ADNOC Inspection Agent application. Built with React, TypeScript, and Tailwind CSS following existing project patterns.

## Features Implemented

### 1. Inspections List Page (`/inspections`)
- **Grid/List Layout**: Responsive grid on desktop, list view on mobile
- **Status Badges**: Color-coded badges for different inspection states:
  - Not Started (Gray)
  - In Progress (Blue)
  - Completed (Green)
  - On Hold (Yellow)
  - Cancelled (Red)
  - Overdue (Red - when not started and past scheduled date)
- **Filters**:
  - Search by asset name/number
  - Filter by status
  - Filter by inspection type (routine, statutory, RBI, shutdown, emergency)
  - Date range filters (from/to)
- **Pagination**: Full pagination with page navigation
- **Quick Actions**: Start/Complete buttons directly on cards
- **Real-time Updates**: Automatic refetch after mutations

### 2. Inspection Detail View (`/inspections/:id`)
- **Overview Card**:
  - Inspection type
  - Scheduled date
  - Actual start/end times
  - Duration calculation
  - Location
  - Weather conditions
- **Inspector Information**: Primary inspector details
- **Notes Section**: Full inspection notes display
- **Status Actions**: Start/Complete inspection buttons
- **Findings Management**: Complete findings section

### 3. Findings Management
- **Add Finding Form**:
  - Finding type selection (defect, observation, recommendation, OK)
  - Severity levels (low, medium, high, critical)
  - Description with validation
  - Location on asset
  - Photo upload with camera capture support
  - Photo preview with removal capability
  - Corrective action checkbox
  - Corrective action description and deadline
- **Findings List**:
  - Displays all findings with severity badges
  - Shows photos in grid layout
  - Clickable photos for full view
  - Corrective action details
  - Timestamps for each finding

### 4. Photo Management
- **Upload**: Multi-file upload support
- **Camera Capture**: Mobile camera integration (`capture="environment"`)
- **Preview**: Thumbnail previews before submission
- **Gallery**: Grid display of uploaded photos
- **Full View**: Click to open photos in new tab

### 5. Mobile Optimization
- **Responsive Design**: Optimized for tablets and phones
- **Touch-Friendly**: Large touch targets for field use
- **Camera Integration**: Direct camera access on mobile devices
- **Adaptive Layout**: Single column on mobile, grid on desktop
- **Quick Actions**: Easy-to-tap buttons for field inspectors

## Component Structure

```
/src/components/inspections/
├── InspectionCard.tsx           # Card component for list view
├── InspectionFilters.tsx        # Filter component with all filter options
├── InspectionDetailView.tsx     # Full detail view with findings
├── FindingForm.tsx              # Modal form for adding findings
├── FindingsList.tsx             # List display of all findings
├── InspectionStatusTimeline.tsx # Status progression timeline
└── index.ts                     # Barrel export
```

## Pages

```
/src/pages/inspections/
└── InspectionsPage.tsx          # Main page with list/detail routing
```

## Routes

```typescript
/inspections       - Inspections list
/inspections/:id   - Inspection detail view
```

## API Integration

### Endpoints Used
- `GET /api/v1/inspections` - List inspections with filters
- `GET /api/v1/inspections/:id` - Get inspection details
- `POST /api/v1/inspections/:id/start` - Start inspection
- `POST /api/v1/inspections/:id/complete` - Complete inspection
- `GET /api/v1/inspections/:id/findings` - Get findings
- `POST /api/v1/inspections/:id/findings` - Add finding
- `POST /api/v1/inspections/:id/photos` - Upload photos

### React Query Hooks
- `useInspections()` - Fetch paginated inspections
- `useInspection(id)` - Fetch single inspection
- `useStartInspection()` - Mutation to start inspection
- `useCompleteInspection()` - Mutation to complete inspection
- `useInspectionFindings(id)` - Fetch findings for inspection
- `useAddFinding()` - Mutation to add finding
- `useUploadPhotos()` - Mutation to upload photos

## Type Definitions

```typescript
interface Inspection {
  id: number;
  planned_inspection_id: number;
  asset_id: number;
  inspection_type: InspectionType;
  inspection_date: string;
  status: InspectionStatus;
  primary_inspector_id: number;
  secondary_inspector_ids?: number[];
  actual_start_time?: string;
  actual_end_time?: string;
  weather_conditions?: string;
  inspection_notes?: string;
  created_at: string;
  updated_at: string;
}

interface InspectionFinding {
  id: number;
  inspection_id: number;
  finding_type: FindingType;
  severity: Severity;
  description: string;
  location_on_asset: string;
  photos: string[];
  measurements?: Record<string, unknown>;
  corrective_action_required: boolean;
  corrective_action_description?: string;
  corrective_action_deadline?: string;
  created_at: string;
  updated_at: string;
}
```

## UI Components Used
- **shadcn/ui components**:
  - Card, CardContent, CardHeader, CardTitle
  - Badge
  - Button
  - Input
  - Label
  - Textarea
  - Select
  - Dialog (Radix UI)
- **Lucide React icons**: Calendar, User, Clock, CheckCircle, AlertCircle, etc.
- **Framer Motion**: Smooth animations and transitions
- **date-fns**: Date formatting and calculations

## Tour Integration
Data-tour attributes added for guided tours:
- `data-tour="inspections-page"` - Main page
- `data-tour="inspection-filters"` - Filter section
- `data-tour="inspection-card"` - Individual cards
- `data-tour="start-inspection-btn"` - Start button
- `data-tour="complete-inspection-btn"` - Complete button
- `data-tour="view-inspection-btn"` - View details button
- `data-tour="add-finding"` - Add finding button
- `data-tour="inspection-pagination"` - Pagination controls

## Form Validation
- Required fields: Description, Location, Finding Type, Severity
- Conditional validation: Corrective action description required when checkbox is checked
- Real-time error display with icons
- Prevents submission with invalid data

## Status Management
- **Not Started**: Initial state, shows "Start" button
- **In Progress**: Active inspection, shows "Complete" button and "Add Finding" button
- **Completed**: Finished inspection, read-only view
- **On Hold**: Paused inspection
- **Cancelled**: Cancelled inspection
- **Overdue**: Not started and past scheduled date (special badge color)

## Photo Upload Features
- Multiple file selection
- Camera capture on mobile devices
- Image preview before upload
- Individual photo removal
- Grid display in findings
- Clickable full-size view
- Supports FormData upload to backend

## Responsive Breakpoints
- **Mobile** (< 768px): Single column, stacked layout
- **Tablet** (768px - 1024px): 2-column grid
- **Desktop** (> 1024px): 3-column grid

## Performance Optimizations
- React Query caching (5 minutes stale time)
- Optimistic updates for mutations
- Lazy loading with pagination
- Framer Motion transitions for smooth UX
- Debounced search (via controlled input)

## Error Handling
- Loading states for all async operations
- Error states with user-friendly messages
- Retry logic via React Query
- Console error logging for debugging
- Form validation errors

## Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management in dialogs
- Color contrast compliant badges

## Testing Considerations
- All components are pure and testable
- Props interfaces for easy mocking
- Separation of concerns (UI vs logic)
- React Query hooks can be mocked
- Form validation logic is isolated

## Future Enhancements (Optional)
- Offline support with service workers
- Photo compression before upload
- Signature capture for inspector
- Voice notes for findings
- Barcode/QR code scanning for assets
- Bulk operations (multi-select)
- Export findings to PDF
- Share inspection report via email

## Dependencies Added
- `@radix-ui/react-dialog` - For modal dialogs

## File Locations

### Components
- `/src/components/inspections/InspectionCard.tsx`
- `/src/components/inspections/InspectionFilters.tsx`
- `/src/components/inspections/InspectionDetailView.tsx`
- `/src/components/inspections/FindingForm.tsx`
- `/src/components/inspections/FindingsList.tsx`
- `/src/components/inspections/InspectionStatusTimeline.tsx`
- `/src/components/inspections/index.ts`

### Pages
- `/src/pages/inspections/InspectionsPage.tsx`

### Routes
- `/src/App.tsx` (updated with inspection routes)

## Usage Example

```typescript
// Navigate to inspections
navigate('/inspections');

// View specific inspection
navigate('/inspections/123');

// Start inspection
await startInspection.mutateAsync(inspectionId);

// Add finding
await addFinding.mutateAsync({
  inspectionId: 123,
  finding: {
    finding_type: 'defect',
    severity: 'high',
    description: 'Corrosion detected',
    location_on_asset: 'North face, 3m from top',
    photos: ['url1', 'url2'],
    corrective_action_required: true,
    corrective_action_description: 'Replace affected section',
    corrective_action_deadline: '2026-02-01',
  },
});
```

## Notes
- All code follows existing project patterns
- TypeScript strict mode compliant
- Uses existing services and hooks
- Integrates with existing AuthContext
- Follows project's Tailwind CSS conventions
- No hardcoded values (uses environment variables)
- Production-ready code with proper error handling
