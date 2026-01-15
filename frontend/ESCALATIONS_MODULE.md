# Escalations Module - ADNOC Inspection Agent

## Overview

The Escalations module is a comprehensive system for managing overdue inspections and critical items that require immediate attention. It provides a complete workflow for tracking, escalating, and resolving inspection delays with multiple levels of escalation based on the number of days overdue.

## Features

### 1. Escalation Levels
- **Level 1**: 1-7 days overdue (Yellow indicator)
- **Level 2**: 8-14 days overdue (Orange indicator)
- **Level 3**: 15+ days overdue (Red indicator)
- **Critical Findings**: Always escalated regardless of days overdue (Dark red)

### 2. Dashboard Statistics
- **Total Escalations**: Overall count of active escalations
- **Level 3 (Critical)**: Count of most urgent escalations
- **Resolved This Week**: Number of escalations resolved in the past 7 days
- **Average Resolution Time**: Mean time to resolve escalations in days

### 3. Filtering & Search
- Filter by escalation level (1, 2, 3)
- Filter by severity (low, medium, high, critical)
- Filter by status (open, in_progress, resolved, escalated)
- Search by asset name
- Active filter counter with clear option

### 4. Escalation Actions
- **Reassign Inspection**: Transfer to a different inspector with reason
- **Send Reminder**: Notify assigned inspector about overdue item
- **Mark as Resolved**: Close the escalation with optional resolution notes
- **Escalate Higher**: Move to next escalation level with justification
- **Add Notes/Comments**: Document discussions and progress

### 5. Detail View
Three main tabs:
- **Details**: Core information, notes, and critical warnings
- **Timeline**: Complete action history with timestamps
- **Comments**: Discussion thread for team collaboration

### 6. Role Access
- Available to: `team_leader` and `admin` roles only
- Restricted from other user roles

## File Structure

```
frontend/src/
├── types/
│   └── escalation.ts                      # TypeScript interfaces
├── services/
│   └── escalationService.ts               # API service layer
├── hooks/
│   └── useEscalations.ts                  # React Query hooks
├── components/
│   └── escalations/
│       ├── EscalationCard.tsx             # List item component
│       └── EscalationDetailDialog.tsx     # Detail modal
└── pages/
    └── escalations/
        └── EscalationsPage.tsx            # Main page component
```

## Types

### Core Types (`types/escalation.ts`)

```typescript
export type EscalationLevel = 1 | 2 | 3;
export type EscalationStatus = 'open' | 'in_progress' | 'resolved' | 'escalated';

export interface Escalation extends BaseEntity {
  inspection_id: number;
  asset_id: number;
  asset_name: string;
  inspection_type: string;
  scheduled_date: string;
  actual_overdue_days: number;
  escalation_level: EscalationLevel;
  severity: Severity;
  assigned_to_id: number;
  assigned_to_name: string;
  status: EscalationStatus;
  notes?: string;
  last_reminder_sent?: string;
  resolution_date?: string;
}

export interface EscalationStats {
  total_escalations: number;
  level_1: number;
  level_2: number;
  level_3: number;
  critical: number;
  resolved_this_week: number;
  average_resolution_days: number;
}
```

## API Endpoints

The service expects these backend endpoints:

```
GET    /api/v1/escalations              # List with filters
GET    /api/v1/escalations/{id}         # Get single escalation
GET    /api/v1/escalations/stats        # Get statistics
GET    /api/v1/escalations/{id}/comments # Get comments
POST   /api/v1/escalations/{id}/comments # Add comment
GET    /api/v1/escalations/{id}/actions  # Get action history
POST   /api/v1/escalations/{id}/reassign # Reassign inspection
POST   /api/v1/escalations/{id}/remind   # Send reminder
POST   /api/v1/escalations/{id}/resolve  # Mark resolved
POST   /api/v1/escalations/{id}/escalate # Escalate higher
POST   /api/v1/escalations/{id}/notes    # Add note
```

## React Query Hooks

### Available Hooks

```typescript
// Fetch hooks
useEscalations(filters?)          // Get paginated list
useEscalation(id)                 // Get single item
useEscalationStats()              // Get statistics
useEscalationComments(id)         // Get comments
useEscalationActions(id)          // Get action history

// Mutation hooks
useReassignEscalation()           // Reassign inspection
useSendReminder()                 // Send reminder
useResolveEscalation()            // Mark resolved
useEscalateHigher()               // Escalate to next level
useAddComment()                   // Add comment
useAddNote()                      // Add note
```

### Usage Example

```typescript
const { data: escalations, isLoading } = useEscalations({
  level: 3,
  severity: 'critical',
  page: 1,
  page_size: 12
});

const resolveMutation = useResolveEscalation();

const handleResolve = async (id: number) => {
  await resolveMutation.mutateAsync({
    id,
    note: 'Inspection completed successfully'
  });
};
```

## Components

### EscalationCard

Displays a single escalation in list/grid view:
- Color-coded level indicator
- Days overdue with clock icon
- Severity and status badges
- Assigned inspector
- Critical warnings for critical findings
- Notes preview

### EscalationDetailDialog

Full-screen modal with:
- Header with badges and key metrics
- Action buttons (Reassign, Remind, Resolve, Escalate)
- Three tabs: Details, Timeline, Comments
- Inline dialogs for actions requiring input
- Real-time updates via React Query

## Styling & Responsiveness

- Uses Tailwind CSS for styling
- Framer Motion for animations
- Fully responsive design:
  - Grid layout on desktop (3 columns)
  - Stack layout on mobile
  - Collapsible filters on small screens
- Data-tour attributes for onboarding tours

## Color Scheme

### Escalation Levels
- Level 1: Yellow (`bg-yellow-100 text-yellow-800 border-yellow-300`)
- Level 2: Orange (`bg-orange-100 text-orange-800 border-orange-300`)
- Level 3: Red (`bg-red-100 text-red-800 border-red-300`)

### Severity
- Low: Blue (`bg-blue-100 text-blue-800`)
- Medium: Yellow (`bg-yellow-100 text-yellow-800`)
- High: Orange (`bg-orange-100 text-orange-800`)
- Critical: Red (`bg-red-100 text-red-800`)

### Status
- Open: Gray (`bg-gray-100 text-gray-800`)
- In Progress: Blue (`bg-blue-100 text-blue-800`)
- Resolved: Green (`bg-green-100 text-green-800`)
- Escalated: Red (`bg-red-100 text-red-800`)

## Data Tour Integration

Tour stop IDs:
- `escalations-page`: Main page container
- `total-escalations`: Total count card
- `level-3-escalations`: Critical escalations card
- `resolved-this-week`: Resolved count card
- `avg-resolution-time`: Average resolution time card
- `escalation-card`: Individual card (first item)
- `escalation-pagination`: Pagination controls
- `escalation-detail-dialog`: Detail modal

## Backend Requirements

The backend must implement:

1. **Automatic escalation calculation**:
   - Calculate days overdue based on scheduled date
   - Assign escalation level: 1-7 days = L1, 8-14 = L2, 15+ = L3
   - Override to L3 for critical severity items

2. **Statistics aggregation**:
   - Real-time counts for each level
   - Weekly resolution tracking
   - Average resolution time calculation

3. **Action logging**:
   - Record all state changes
   - Track reassignments, reminders, escalations
   - Store user who performed action

4. **Notifications**:
   - Email/SMS reminders for assigned inspectors
   - Alerts for new escalations
   - Resolution confirmations

## Testing Checklist

- [ ] Escalation list loads with correct data
- [ ] Filters work correctly (level, severity, status)
- [ ] Search by asset name functions
- [ ] Statistics cards show accurate counts
- [ ] Pagination works for large datasets
- [ ] Detail dialog opens and displays full info
- [ ] Reassign action changes assigned inspector
- [ ] Send reminder triggers notification
- [ ] Mark resolved updates status
- [ ] Escalate higher increases level (if not L3)
- [ ] Comments can be added and displayed
- [ ] Timeline shows action history
- [ ] Mobile responsive layout works
- [ ] Role access restrictions enforced
- [ ] Loading and error states display correctly

## Future Enhancements

1. **Email Templates**: Customizable reminder templates
2. **Bulk Actions**: Select multiple escalations for batch operations
3. **Export**: Download escalation reports as CSV/PDF
4. **Notifications**: In-app notification center
5. **SLA Tracking**: Automatic escalation based on SLA violations
6. **Escalation Rules**: Configurable thresholds for escalation levels
7. **Assignment Rules**: Auto-assign based on workload/availability
8. **Mobile App**: Native mobile app for on-the-go management

## License

Proprietary - ADNOC Internal Use Only
