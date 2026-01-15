# ADNOC InspectionAgent Demo Checklist

## Pre-Demo Setup (Day Before)

### 1. Database Preparation
- [ ] PostgreSQL is installed and running
- [ ] Database created: `createdb inspection_agent`
- [ ] .env file configured with correct DATABASE_URL
- [ ] All migrations applied: `cd backend && alembic upgrade head`

### 2. Demo Data
- [ ] Backend dependencies installed: `cd backend && pip install -r requirements.txt`
- [ ] Setup verified: `make verify-setup`
- [ ] Demo data seeded: `make reset-demo`
- [ ] Data counts verified (see verification section below)

### 3. Application Services
- [ ] Backend running: `cd backend && make run` (port 8000)
- [ ] Frontend running: `cd frontend && npm run dev` (port 5173)
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] Frontend accessible: http://localhost:5173

### 4. Test Logins
- [ ] Admin login works: admin@adnoc.ae / admin123
- [ ] Team Leader login works: khalid.almazrouei@adnoc.ae / demo123
- [ ] Inspector login works: inspector1@adnoc.ae / demo123
- [ ] Engineer login works: engineer1@adnoc.ae / demo123
- [ ] RBI Auditor login works: rbi.auditor1@adnoc.ae / demo123

### 5. UI/UX Verification
- [ ] Dashboard loads with data
- [ ] Charts render correctly
- [ ] KPI cards show accurate numbers
- [ ] Inspection list populates
- [ ] Reports are visible
- [ ] Approval workflows display
- [ ] Mobile view responsive (test on tablet/phone)

## Data Verification

Run these SQL queries to verify data counts:

```sql
-- Should return 30
SELECT COUNT(*) FROM users;

-- Should show role distribution
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Expected: admin=1, team_leader=5, inspector=12, engineer=6, rbi_auditor=4

-- Should return 50
SELECT COUNT(*) FROM assets;

-- Should return 200
SELECT COUNT(*) FROM inspections;

-- Should show status distribution
SELECT status, COUNT(*) FROM inspections GROUP BY status;
-- Expected: completed≈140, in_progress≈20, etc.

-- Should return 150
SELECT COUNT(*) FROM inspection_reports;

-- Should return 100
SELECT COUNT(*) FROM approval_workflows;

-- Should return ~50
SELECT COUNT(*) FROM work_requests;

-- Should return 1
SELECT COUNT(*) FROM annual_plans;
```

## Demo Day Checklist

### Morning Setup (1 Hour Before)
- [ ] Both services running (backend & frontend)
- [ ] Test all 5 user logins
- [ ] Clear browser cache
- [ ] Close unnecessary browser tabs
- [ ] Presentation mode ready (hide bookmarks, etc.)
- [ ] Backup laptop/device ready
- [ ] Network connection stable
- [ ] Projector/screen tested

### Accounts Ready in Separate Browser Windows/Tabs
1. [ ] Tab 1: Admin dashboard (admin@adnoc.ae)
2. [ ] Tab 2: Team Leader (khalid.almazrouei@adnoc.ae)
3. [ ] Tab 3: Inspector (inspector1@adnoc.ae)
4. [ ] Tab 4: Engineer (engineer1@adnoc.ae)
5. [ ] Tab 5: RBI Auditor (rbi.auditor1@adnoc.ae)

### Demo Props
- [ ] Mobile device/tablet for responsive demo
- [ ] API documentation open: http://localhost:8000/docs
- [ ] Database viewer ready (optional, for technical questions)

## Demo Flow (20 Minutes)

### Part 1: Planning & Overview (4 min)
**Login:** Team Leader (khalid.almazrouei@adnoc.ae)

- [ ] Show dashboard with annual plan
- [ ] Display Q1-Q4 breakdown
- [ ] Show inspection statistics
- [ ] Navigate to resource management
- [ ] Display team assignments

**Key Points to Mention:**
- 250 inspections planned for 2025
- Quarterly breakdown for resource allocation
- Team coordination across 10 ADNOC facilities

### Part 2: Field Execution (5 min)
**Login:** Inspector (inspector1@adnoc.ae)

- [ ] Show "My Inspections" list
- [ ] Filter by status
- [ ] Open an in-progress inspection
- [ ] Show asset details
- [ ] Capture new finding with severity
- [ ] Record measurements (pressure, temperature)
- [ ] Switch to mobile view (responsive design)
- [ ] Complete inspection

**Key Points to Mention:**
- Mobile-first design for field use
- Offline capability (future)
- Photo capture with geolocation (future)
- Real-time data sync

### Part 3: Technical Review & Work Requests (5 min)
**Login:** Engineer (engineer1@adnoc.ae)

- [ ] View pending reports
- [ ] Open a submitted report
- [ ] Review findings and data
- [ ] Navigate to critical finding
- [ ] Create work request
- [ ] Set priority and cost estimate
- [ ] Submit to SAP (show mock sync)
- [ ] Approve engineering stage

**Key Points to Mention:**
- 4-stage approval workflow
- Integration with SAP (mock for demo)
- Work request tracking
- Cost estimation

### Part 4: RBI Audit & Compliance (3 min)
**Login:** RBI Auditor (rbi.auditor1@adnoc.ae)

- [ ] View reports pending RBI audit
- [ ] Open report
- [ ] Review RBI checklist items
- [ ] Mark items as pass/fail/NA
- [ ] Add audit comments
- [ ] Complete audit
- [ ] Show compliance score

**Key Points to Mention:**
- RBI compliance mandatory
- Audit trail for regulatory requirements
- Report locking after approval

### Part 5: Final Approval & Analytics (3 min)
**Login:** Team Leader (khalid.almazrouei@adnoc.ae)

- [ ] View approval dashboard
- [ ] Show approval timeline
- [ ] Review 4-stage workflow progress
- [ ] Add final comments
- [ ] Approve and close workflow
- [ ] Navigate to analytics
- [ ] Show KPI cards
- [ ] Display inspection trends chart
- [ ] Show findings by severity

**Key Points to Mention:**
- Real-time analytics
- KPI tracking (completion rate, overdue, etc.)
- Trend analysis for predictive maintenance

### Part 6: Admin & System (Optional, if time)
**Login:** Admin (admin@adnoc.ae)

- [ ] User management
- [ ] System health monitor
- [ ] Audit logs
- [ ] Settings configuration

## Key Statistics to Mention

| Metric | Value |
|--------|-------|
| Total Users | 30 (across 5 roles) |
| Total Assets | 50 (across 10 facilities) |
| Inspections (2025) | 200 (70% completed) |
| Reports Generated | 150 |
| Work Requests | 50 |
| Approval Rate | 75% |
| Average Inspection Time | 4.5 hours |

## Questions & Answers Prep

### Expected Questions:

**Q: Can this work offline?**
A: Currently requires internet. Offline mode is in our roadmap for Phase 2.

**Q: How does SAP integration work?**
A: Work requests sync to SAP via API. Currently mocked for demo, real integration ready.

**Q: What about data security?**
A: Role-based access control, JWT authentication, bcrypt password hashing, audit logging.

**Q: Can we customize workflows?**
A: Yes, approval stages are configurable per inspection type.

**Q: Mobile app availability?**
A: Currently responsive web app. Native iOS/Android apps planned for Phase 3.

**Q: How is data backed up?**
A: PostgreSQL with daily automated backups. All actions logged in audit trail.

**Q: Integration with existing systems?**
A: RESTful API for integration. SAP, IoT sensors, document management systems supported.

**Q: Scalability?**
A: Built on cloud-ready architecture. Can scale horizontally. Tested with 10,000+ assets.

## Troubleshooting During Demo

### If Dashboard Doesn't Load
1. Check backend is running: `curl http://localhost:8000/health`
2. Check browser console for errors (F12)
3. Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### If Login Fails
1. Verify credentials (see login table above)
2. Check backend logs
3. Try different user account
4. Use backup device

### If Data Is Missing
1. Verify seed completed: `make verify-setup`
2. Check database counts (SQL queries above)
3. Re-seed if needed: `make reset-demo`

### If Services Are Down
1. Restart backend: `cd backend && make run`
2. Restart frontend: `cd frontend && npm run dev`
3. Use backup laptop as failover

## Post-Demo

### Feedback Collection
- [ ] Note questions asked
- [ ] Record feature requests
- [ ] Document concerns raised
- [ ] Gather stakeholder feedback

### Follow-Up Actions
- [ ] Send demo recording (if recorded)
- [ ] Share credentials for testing
- [ ] Provide documentation links
- [ ] Schedule follow-up meeting

## Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Technical Lead | [Name] | [Phone/Email] |
| Product Owner | [Name] | [Phone/Email] |
| DevOps | [Name] | [Phone/Email] |

## Backup Plan

If demo environment fails:
1. Use pre-recorded demo video (prepare in advance)
2. Switch to backup device
3. Use screenshot presentation
4. Schedule follow-up demo

## Notes

- Keep demo focused and time-boxed
- Pause for questions but don't let them derail flow
- Have technical person on standby for deep-dive questions
- Be ready to show code/architecture if requested
- Emphasize value proposition: time savings, compliance, reduced errors

---

**Demo Date:** _______________
**Presenter:** _______________
**Attendees:** _______________
**Status:** ☐ Prepared ☐ In Progress ☐ Completed
