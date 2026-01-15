# InspectionAgent Demo Data Quick Reference

## Quick Start

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies (if not already done)
pip install -r requirements.txt

# 3. Run database migrations
alembic upgrade head

# 4. Seed demo data
make seed-demo

# OR reset everything and reseed
make reset-demo
```

## Login Credentials

| Role | Email | Password | Use Case |
|------|-------|----------|----------|
| Admin | admin@adnoc.ae | admin123 | System overview, user management, reports |
| Team Leader | khalid.almazrouei@adnoc.ae | demo123 | Resource allocation, approvals, oversight |
| Inspector | inspector1@adnoc.ae | demo123 | Field inspection execution, data capture |
| Engineer | engineer1@adnoc.ae | demo123 | Technical review, work request creation |
| RBI Auditor | rbi.auditor1@adnoc.ae | demo123 | Compliance audit, report locking |

## Demo Data Summary

### Users: 30 Total
- 1 Admin
- 5 Team Leaders
- 12 Inspectors
- 6 Engineers
- 4 RBI Auditors

### Assets: 50 Total
Distributed across:
- **Locations:** 10 ADNOC facilities (Ruwais, Das Island, Fujairah, etc.)
- **Types:** Pressure vessels, pipelines, tanks, heat exchangers, pumps, valves
- **Criticality:** Critical (10%), High (30%), Medium (40%), Low (20%)

### Inspections: 200 Total
- **Completed:** 140 (70%)
- **In Progress:** 20 (10%)
- **Not Started:** 10 (5%)
- **On Hold:** 20 (10%)
- **Cancelled:** 10 (5%)

### Reports: 150 Total
- **Draft:** 30 (20%)
- **Submitted:** 45 (30%)
- **Approved:** 75 (50%)

### Approval Workflows: 100
All following 4-stage approval process:
1. Inspector Review
2. Engineering Review
3. RBI Audit
4. Team Leader Approval

### Work Requests: 50
Generated from inspection findings with:
- Priority levels: Critical, High, Medium, Low
- SAP sync status tracking
- Cost estimates

### Annual Plan: 1
- **Year:** 2025
- **Total Inspections:** 250
- **Quarterly Breakdown:** Q1 (60), Q2 (65), Q3 (60), Q4 (65)
- **Status:** In Progress

## ADNOC-Specific Data

### Locations
1. Abu Dhabi Refinery
2. Ruwais Refinery Complex
3. Habshan Gas Processing Plant
4. Jebel Dhanna Terminal
5. Das Island Facilities
6. Fujairah Refinery
7. Al Yasat Offshore Platform
8. ADNOC Offshore Operations
9. Takreer Main Terminal
10. Ghasha Sour Gas Development

### Asset Naming Convention
- **Format:** `ADNOC-{TYPE}-{NUMBER}`
- **Examples:**
  - ADNOC-PR-1001 (Pressure Vessel)
  - ADNOC-PI-1015 (Pipeline)
  - ADNOC-TA-1030 (Tank)
  - ADNOC-HE-1045 (Heat Exchanger)

### Report Numbering
- **Format:** `RPT-{YEAR}-{SEQUENCE}`
- **Example:** RPT-2025-00001

### Work Request Numbering
- **Format:** `WR-{YEAR}-{SEQUENCE}`
- **Example:** WR-2025-00001

## Demo Presentation Flow

### Part 1: Planning (Team Leader View)
**Login:** khalid.almazrouei@adnoc.ae / demo123

1. Navigate to Dashboard
   - Show annual plan overview
   - Display Q1-Q4 breakdown
   - View inspection statistics

2. Resource Management
   - Show team assignments
   - Display inspector availability
   - Review workload distribution

### Part 2: Field Execution (Inspector View)
**Login:** inspector1@adnoc.ae / demo123

1. My Inspections
   - View assigned inspections
   - Filter by status and date

2. Execute Inspection
   - Open in-progress inspection
   - Capture findings with photos
   - Record measurements
   - Complete inspection

3. Mobile View
   - Switch to mobile/tablet view
   - Show responsive design
   - Demonstrate touch-friendly interface

### Part 3: Technical Review (Engineer View)
**Login:** engineer1@adnoc.ae / demo123

1. Review Reports
   - View submitted reports
   - Review findings and data
   - Approve technical aspects

2. Create Work Request
   - Select critical finding
   - Generate work request
   - Assign priority and cost
   - Submit to SAP (mock)

### Part 4: RBI Audit (RBI Auditor View)
**Login:** rbi.auditor1@adnoc.ae / demo123

1. Compliance Review
   - View reports pending RBI audit
   - Review RBI checklist items
   - Mark compliance status
   - Add audit comments

2. Final Lock
   - Complete audit successfully
   - Lock report (immutable)

### Part 5: Approval & Oversight (Team Leader View)
**Login:** khalid.almazrouei@adnoc.ae / demo123

1. Approval Dashboard
   - View pending approvals
   - Review approval timeline
   - See 4-stage workflow progress

2. Final Approval
   - Review complete report
   - Add approval comments
   - Approve and close workflow

### Part 6: Analytics & Reports (Admin View)
**Login:** admin@adnoc.ae / admin123

1. Dashboard Analytics
   - View KPI cards (completion rate, findings, overdue)
   - Show inspection trends chart
   - Display findings by severity
   - Asset distribution by criticality

2. System Management
   - User management
   - System health monitor
   - Audit logs
   - Settings

## Key Features to Demonstrate

### 1. Role-Based Access Control
- Different views for each role
- Permission-based feature access
- Secure data isolation

### 2. Mobile-First Design
- Responsive layout (tablet/phone)
- Touch-friendly buttons
- Optimized for field use

### 3. Real-Time Workflow
- Multi-stage approval tracking
- Status updates
- Notification system

### 4. Data Integrity
- Version control for reports
- Immutable locked reports
- Complete audit trail

### 5. Integration Ready
- SAP sync status
- Work request tracking
- External system connectivity

### 6. Analytics & Insights
- Real-time KPI metrics
- Trend analysis
- Performance monitoring

## Common Demo Scenarios

### Scenario 1: Critical Finding Response
1. Inspector finds critical leak
2. Marks as critical severity
3. System auto-escalates
4. Engineer creates urgent WR
5. Team leader approves immediately
6. WR syncs to SAP

### Scenario 2: Routine Inspection Flow
1. Inspector completes routine inspection
2. Report auto-generated
3. Goes through 4-stage approval
4. RBI audit confirms compliance
5. Team leader gives final approval
6. Report locked and archived

### Scenario 3: Annual Planning
1. Team leader creates annual plan
2. System breaks down into quarters
3. Assets assigned to quarters
4. Resources allocated
5. Progress tracked throughout year

## Troubleshooting

### Reset Demo Data
```bash
cd backend
make reset-demo
```

### Check Data Counts
```bash
psql inspection_agent -c "
SELECT
  'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Assets', COUNT(*) FROM assets
UNION ALL
SELECT 'Inspections', COUNT(*) FROM inspections
UNION ALL
SELECT 'Reports', COUNT(*) FROM inspection_reports
UNION ALL
SELECT 'Workflows', COUNT(*) FROM approval_workflows
UNION ALL
SELECT 'Work Requests', COUNT(*) FROM work_requests;
"
```

### Clear and Reseed
```bash
# Stop backend if running
# Drop database
dropdb inspection_agent

# Recreate
createdb inspection_agent

# Run migrations
cd backend
alembic upgrade head

# Seed data
make seed-demo
```

## Data Customization

### Change User Count
Edit `backend/scripts/seed_demo_data.py`:
```python
# Line ~100
for i in range(12):  # Change 12 to desired inspector count
    user = User(...)
```

### Add Custom Locations
Edit `backend/scripts/seed_demo_data.py`:
```python
ADNOC_LOCATIONS = [
    "Abu Dhabi Refinery",
    "Your Custom Location",  # Add here
    ...
]
```

### Adjust Inspection Count
Edit function call in `main()`:
```python
inspections = create_inspections(db, assets, users, 200)  # Change 200
```

## Support Resources

- **INITIAL.md** - Complete product requirements
- **CLAUDE.md** - Project coding standards
- **backend/scripts/README.md** - Detailed script documentation
- **backend/README.md** - Backend setup guide

## Next Steps After Seeding

1. **Start Backend:**
   ```bash
   cd backend
   make run
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Login & Explore:**
   - Use credentials from table above
   - Navigate through different roles
   - Practice demo flow

## Demo Checklist

- [ ] Database reset and seeded
- [ ] Backend running (port 8000)
- [ ] Frontend running (port 5173)
- [ ] Admin login working
- [ ] All role accounts accessible
- [ ] Dashboard loading with data
- [ ] Inspections visible
- [ ] Reports showing
- [ ] Approval workflows active
- [ ] Work requests created
- [ ] Mobile view responsive
- [ ] Charts rendering correctly

## Presentation Tips

1. **Start with Dashboard** - Show overall system health and metrics
2. **Highlight Mobile UX** - Switch to tablet/phone view for field demo
3. **Walk Through Workflow** - Complete end-to-end inspection flow
4. **Show Approval Process** - Demonstrate 4-stage approval with multiple logins
5. **Emphasize Analytics** - Display real-time KPIs and trends
6. **Discuss Scalability** - Mention integration capabilities (SAP, IoT)

---

**Last Updated:** 2026-01-13
**Version:** 1.0.0
**Status:** Ready for Demo
