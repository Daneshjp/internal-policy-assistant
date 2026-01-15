# Analytics Dashboard

## Overview
Complete analytics dashboard for the ADNOC Inspection Agent application, providing comprehensive insights into inspection performance, asset management, and inspector productivity.

## Location
`/Users/manojaidude/AdNoc/frontend/src/pages/analytics/AnalyticsPage.tsx`

## Access Control
- **Allowed Roles:** `team_leader`, `admin`
- **Restricted:** Other users see an access denied message

## Features

### 1. KPI Cards (Top Row)
Five key performance indicators with trend indicators:
- **Total Inspections** - Count of all inspections with percentage change
- **Completion Rate** - Percentage of completed inspections
- **Average Time to Complete** - Mean duration for inspection completion
- **Critical Findings** - Count of critical severity findings
- **Overdue Inspections** - Number of overdue inspections

Each KPI card includes:
- Colored icon indicator
- Large value display
- Trend arrow (up/down)
- Percentage change vs previous period

### 2. Filter Controls
Interactive filters for data analysis:
- **Date Range:** Last 7, 30, 60, or 90 days
- **Facility:** Filter by specific ADNOC facilities
- **Asset Type:** Filter by equipment category
- **Inspector:** Filter by individual inspector

### 3. Charts & Visualizations

#### Inspections Over Time (Line Chart)
- Daily inspection trends
- Three series: Completed, In Progress, Planned
- Responsive to date range filter
- Dynamic data generation based on selected period

#### Findings by Severity (Pie Chart)
- Distribution of findings: Low, Medium, High, Critical
- Color-coded by severity level
- Percentage labels on chart

#### Assets by Criticality (Bar Chart)
- Asset count by criticality level
- Vertical bar chart
- Clear labeling

#### Inspector Performance (Horizontal Bar Chart)
- Top 5 inspectors comparison
- Two metrics: Completed inspections, Findings count
- Side-by-side bars

#### Facility-wise Distribution (Dual Axis Bar Chart)
- Inspection count per facility (left axis)
- Completion percentage (right axis)
- Covers 5 major ADNOC facilities

#### Monthly Trends (Multi-line Chart)
- 6-month overview
- Three metrics: Inspections, Findings, Average Time
- Dual Y-axis for different scales

### 4. Data Tables

#### Top 10 Assets by Inspection Frequency
Columns:
- Asset Number & Name
- Total Inspections (badge)
- Last Inspection Date
- Next Inspection Date

#### Inspector Performance Metrics
Columns:
- Inspector Name
- Completed Count (green badge)
- Average Time (hours)
- Findings Count (yellow badge)

#### Recent Critical Findings
Columns:
- Asset Name
- Description (truncated)
- Severity Badge (color-coded)
- Date
- Inspector Name

### 5. Export Functionality
- **Export Report** button in header
- Generates CSV file with:
  - All KPI metrics
  - Top assets data
  - Timestamp
- Auto-downloads with dated filename

## Technical Implementation

### Dependencies
```typescript
- recharts: ^2.15.4 (charts)
- date-fns: ^3.0.6 (date handling)
- lucide-react: ^0.309.0 (icons)
- @/components/ui/* (UI components)
```

### State Management
```typescript
- dateRange: string (filter)
- selectedFacility: string (filter)
- selectedAssetType: string (filter)
- selectedInspector: string (filter)
```

### Data Flow
1. Filters update state
2. useMemo hook recalculates chart data based on filters
3. Components re-render with filtered data
4. Currently uses mock data (ready for API integration)

### Responsive Design
- Mobile-first approach
- Grid layout adapts to screen size
- Tables scroll horizontally on small screens
- Charts use ResponsiveContainer from recharts

### Color Scheme
- **Blue (#3b82f6):** Primary, inspections
- **Green (#10b981):** Success, completion
- **Yellow/Orange (#f59e0b):** Warning, medium severity
- **Red (#ef4444, #dc2626):** Critical, high priority
- **Purple (#a855f7):** Secondary metrics
- **Gray:** Text, borders, backgrounds

### Data Tour Attributes
All major sections include `data-tour` attributes for guided tours:
- `analytics-page`: Main container
- `filters`: Filter section
- `kpi-cards`: KPI row
- `inspections-trend`: Line chart
- `findings-severity`: Pie chart
- `assets-criticality`: Bar chart
- `inspector-performance`: Performance chart
- `facility-distribution`: Facility chart
- `monthly-trends`: Trends chart
- `top-assets`: Assets table
- `inspector-metrics`: Inspector table
- `critical-findings`: Findings table
- `export-button`: Export button

## Mock Data
Currently implemented with realistic mock data:
- 284 total inspections
- 94.3% completion rate
- 3.2h average completion time
- 23 critical findings
- 7 overdue inspections
- 5 inspectors with performance data
- 5 major ADNOC facilities
- 232 assets across criticality levels

## API Integration (Future)
Replace mock data with API calls to:
```typescript
GET /api/analytics/kpis?date_range={range}
GET /api/analytics/inspections/trends?date_range={range}
GET /api/analytics/findings/severity
GET /api/analytics/assets/criticality
GET /api/analytics/inspectors/performance
GET /api/analytics/facilities/distribution
GET /api/analytics/trends/monthly
GET /api/analytics/assets/top
GET /api/analytics/findings/critical
```

## Usage

### Viewing Analytics
1. Login as team_leader or admin
2. Navigate to `/analytics`
3. View KPIs and charts
4. Apply filters as needed
5. Export report if required

### Customizing Filters
```typescript
// Date range options: 7, 30, 60, 90 days
setDateRange('30');

// Facility options
setSelectedFacility('ruwais');

// Asset type options
setSelectedAssetType('pressure_vessel');

// Inspector filter
setSelectedInspector('Ahmed Al-Mansoori');
```

### Exporting Data
```typescript
handleExportData() {
  // Creates CSV with:
  // - Analytics Report header
  // - KPI metrics
  // - Top assets
  // Downloads: analytics-report-YYYY-MM-DD.csv
}
```

## Performance Considerations
- Charts use memoization (useMemo) for efficiency
- Responsive containers prevent layout shifts
- Data truncation in tables for readability
- Optimized re-renders with React best practices

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive from 320px to 4K displays

## Testing
Test the following scenarios:
1. Access control (different user roles)
2. Filter interactions
3. Chart responsiveness
4. Export functionality
5. Mobile view
6. Data loading states
7. Error handling

## Future Enhancements
1. Real-time data updates
2. Custom date range picker
3. Advanced filtering options
4. Drill-down capabilities
5. Print-friendly view
6. Share report functionality
7. Scheduled report generation
8. Comparison views (period-over-period)
9. Predictive analytics
10. Interactive chart tooltips with actions

## Maintenance
- Update mock data when API is ready
- Adjust filters based on actual facility names
- Tune chart colors to match brand guidelines
- Add loading states for API calls
- Implement error boundaries
- Add unit tests for calculations

## Support
For issues or feature requests, contact the development team or create a ticket in the project management system.
