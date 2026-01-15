# InspectionAgent - Complete User Guide

**ADNOC Inspection Workflow Management System**
Version 1.0.0 | January 2026

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Features Overview](#features-overview)
5. [Module-by-Module Guide](#module-by-module-guide)
6. [Workflows](#workflows)
7. [Mobile Usage](#mobile-usage)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Introduction

### What is InspectionAgent?

InspectionAgent is a comprehensive inspection workflow management system designed specifically for ADNOC's oil & gas facilities. It manages the complete lifecycle of equipment inspections, from annual planning through execution to final approval and reporting.

### Key Benefits

- **Paperless Operations** - Digital inspection forms and mobile data entry
- **Complete Traceability** - Full audit trail of all inspection activities
- **Risk-Based Inspection (RBI)** - Compliance with industry standards
- **Real-Time Collaboration** - Multiple teams working simultaneously
- **Mobile-First Design** - Field inspectors can work on tablets/phones
- **Automated Workflows** - 4-stage approval process with notifications

### System Requirements

**For Desktop Users:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Minimum screen resolution: 1024x768
- Internet connection

**For Mobile Users:**
- iOS 12+ or Android 8+
- Mobile browser or PWA
- Minimum screen size: 375px width
- Camera access for photos

---

## Getting Started

### Accessing the System

1. **Open your web browser** and navigate to:
   ```
   http://localhost:5174
   ```
   *(Replace with production URL when deployed)*

2. **Login Screen**
   - Enter your ADNOC email address
   - Enter your password
   - Click "Sign In"

### First-Time Login

Your system administrator will provide you with:
- Email address (typically: yourname@adnoc.ae)
- Temporary password
- Your role assignment

**Change your password after first login:**
1. Click your profile icon (top right)
2. Select "Profile Settings"
3. Click "Change Password"
4. Enter current password and new password
5. Click "Update Password"

### Test Accounts (Demo Environment Only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@adnoc.ae | admin123 |
| Team Leader | khalid.al.mazrouei@adnoc.ae | demo123 |
| Inspector | inspector1@adnoc.ae | demo123 |
| Engineer | engineer1@adnoc.ae | demo123 |
| RBI Auditor | rbi.auditor1@adnoc.ae | demo123 |

---

## User Roles & Permissions

### 1. Inspector

**Primary Responsibilities:**
- Conduct field inspections
- Record inspection findings
- Capture photos and measurements
- Submit inspection reports for review

**Can Access:**
- ✅ Asset list and details
- ✅ Assigned inspections
- ✅ Inspection execution forms
- ✅ Own inspection history
- ❌ Cannot approve reports
- ❌ Cannot create work requests
- ❌ Cannot modify plans

**Typical Day:**
1. Check daily inspection assignments
2. Navigate to facility location
3. Perform inspections using mobile device
4. Document findings and take photos
5. Submit completed reports

### 2. Team Leader

**Primary Responsibilities:**
- Create annual/quarterly/monthly plans
- Assign inspections to team members
- Monitor team performance
- Final approval of inspection reports
- Manage team resources and schedules

**Can Access:**
- ✅ All planning modules (AIP, QIP, MIP)
- ✅ Team management
- ✅ Resource allocation
- ✅ All inspection reports
- ✅ Final approval authority
- ✅ Dashboard and analytics
- ❌ Cannot edit RBI guidelines
- ❌ Cannot modify system settings

**Typical Day:**
1. Review team dashboard
2. Assign new inspections
3. Monitor inspection progress
4. Review and approve completed reports
5. Handle escalations
6. Update planning schedules

### 3. Engineer

**Primary Responsibilities:**
- Technical review of inspection findings
- Create work requests in SAP
- Assess equipment condition
- Recommend corrective actions
- Second-level approval

**Can Access:**
- ✅ All inspection reports
- ✅ Technical details and findings
- ✅ Work request creation
- ✅ Engineering analysis tools
- ✅ Asset technical data
- ❌ Cannot modify plans
- ❌ Cannot assign inspections

**Typical Day:**
1. Review submitted inspection reports
2. Analyze findings for severity
3. Create work requests for repairs
4. Approve reports for RBI review
5. Collaborate with maintenance teams

### 4. RBI Auditor

**Primary Responsibilities:**
- Ensure RBI compliance
- Audit inspection quality
- Lock final reports
- Maintain RBI guidelines
- Generate compliance reports

**Can Access:**
- ✅ All inspection records
- ✅ RBI compliance dashboard
- ✅ Audit logs
- ✅ RBI guidelines management
- ✅ Quality metrics
- ✅ Final report locking
- ❌ Cannot assign inspections
- ❌ Cannot modify asset data

**Typical Day:**
1. Review engineering-approved reports
2. Check RBI compliance
3. Audit inspection quality
4. Lock final reports
5. Generate compliance reports
6. Update RBI guidelines

### 5. Admin

**Primary Responsibilities:**
- User management
- System configuration
- Access control
- Audit log review
- System health monitoring

**Can Access:**
- ✅ Everything
- ✅ User management
- ✅ System settings
- ✅ Audit logs
- ✅ System health dashboard
- ✅ All modules and features

---

## Features Overview

### 📊 Dashboard

**What it shows:**
- Key Performance Indicators (KPIs)
- Inspection completion rates
- Pending approvals count
- Overdue inspections
- Team performance metrics
- Recent activity feed

**How to use:**
1. Dashboard loads automatically after login
2. View KPI cards at the top
3. Check pie charts for inspection status
4. Review recent activities list
5. Click any metric to drill down

### 🏭 Asset Management

**Purpose:** Centralized database of all equipment and assets requiring inspection

**Features:**
- Search and filter assets
- View asset details and history
- Manage technical documents
- Track inspection schedules
- Equipment criticality levels

**How to navigate:**
1. Click "Assets" in the main menu
2. Use search box to find specific equipment
3. Filter by:
   - Asset Type (tanks, vessels, piping, etc.)
   - Criticality (low, medium, high, critical)
   - Status (active, inactive, maintenance)
   - Location/Facility
4. Click any asset to view details

**Asset Details Page:**
- Basic Information (name, code, type, manufacturer)
- Technical Specifications
- Inspection History
- Related Documents (drawings, certificates)
- Next Inspection Due Date
- RBI Category

### 📅 Planning Module

#### Annual Inspection Plan (AIP)

**Purpose:** High-level plan for the entire year

**How to create:**
1. Navigate to "Planning" → "Annual Plans"
2. Click "Create New Plan"
3. Enter:
   - Plan year (e.g., 2026)
   - Start and end dates
   - Budget allocation
   - Strategic objectives
4. Select assets to include
5. Set target completion rates
6. Save draft or submit for approval

#### Quarterly Inspection Plan (QIP)

**Purpose:** Break down annual plan into quarters

**How to create:**
1. Go to "Planning" → "Quarterly Plans"
2. Select parent Annual Plan
3. Choose quarter (Q1, Q2, Q3, Q4)
4. Allocate tasks from AIP
5. Assign resources
6. Set quarterly milestones
7. Submit for review

#### Monthly Inspection Plan (MIP)

**Purpose:** Detailed monthly execution plan

**How to create:**
1. Navigate to "Planning" → "Monthly Plans"
2. Select parent Quarterly Plan
3. Choose month
4. Break down into specific tasks
5. Assign to individual inspectors
6. Set daily/weekly schedules
7. Publish to team

**Planning Best Practices:**
- Plan at least 2 weeks ahead
- Consider weather and seasonal factors
- Account for resource availability
- Include buffer time for delays
- Coordinate with maintenance shutdowns

### 👥 Team & Resource Management

**Features:**
- Team creation and member assignment
- Inspector availability tracking
- Workload balancing
- Skill matrix management
- Resource allocation

**How to manage teams:**
1. Go to "Teams" → "Team Management"
2. Click "Create Team"
3. Enter team details:
   - Team name
   - Department
   - Specialization (e.g., Pressure Vessel Team)
4. Assign team leader
5. Add team members
6. Set each member's role (lead, assistant, trainee)

**Resource Coordination:**
1. Navigate to "Teams" → "Resource Availability"
2. View calendar of inspector availability
3. Update availability:
   - Available (green)
   - On leave (yellow)
   - On assignment (blue)
   - Unavailable (red)
4. Use drag-and-drop to assign inspections

### 🔍 Inspection Execution

**Mobile-Optimized Interface for Field Work**

#### Starting an Inspection

1. Open "Inspections" → "My Assignments"
2. Find your assigned inspection
3. Click "Start Inspection"
4. Review asset information
5. Confirm you're at the correct location

#### During Inspection

**Checklist Completion:**
- Each inspection has a specific checklist based on asset type
- Check items as complete/incomplete/N/A
- Add notes for any anomalies
- Mark severity: Low, Medium, High, Critical

**Recording Findings:**
1. Click "Add Finding"
2. Select finding type:
   - Corrosion
   - Crack
   - Leak
   - Deformation
   - Coating Failure
   - Other
3. Enter description
4. Assess severity
5. Record location on equipment
6. Take photos

**Taking Photos:**
1. Click camera icon
2. Take photo (or upload from gallery)
3. Add caption describing what's shown
4. Tag with finding reference
5. Photos automatically geo-tagged

**Measurements:**
1. Click "Add Measurement"
2. Select measurement type:
   - Thickness reading
   - Pressure test
   - Temperature
   - Dimension
3. Enter value and unit
4. Note location measured
5. Compare with baseline/threshold

#### Completing Inspection

1. Review all checklist items (100% completion required)
2. Verify all findings documented
3. Add inspector comments/observations
4. Rate overall equipment condition:
   - Excellent
   - Good
   - Fair
   - Poor
   - Critical
5. Click "Submit for Review"

**Offline Mode:**
- Inspections can be performed offline
- Data syncs automatically when online
- Draft saves every 30 seconds
- Photos queued for upload

### 📝 Report Management

#### Draft Reports

**Auto-generated from inspection data**

1. Navigate to "Reports" → "Draft Reports"
2. Select your completed inspection
3. Review generated report
4. Edit sections if needed:
   - Executive summary
   - Findings details
   - Recommendations
   - Conclusion
5. Add attachments
6. Click "Submit Report"

#### Report Templates

**Pre-configured templates by asset type**

Available templates:
- Pressure Vessel Inspection Report
- Tank Inspection Report
- Piping Inspection Report
- Heat Exchanger Inspection Report
- Valve Inspection Report

**Customizing templates:**
1. Go to "Reports" → "Templates" (Admin only)
2. Select template
3. Edit sections, fields, and formatting
4. Set required fields
5. Save as new version

#### Report Export

**Multiple formats available:**
- PDF (most common)
- Excel (for data analysis)
- Word (for editing)

**How to export:**
1. Open report
2. Click "Export" button
3. Select format
4. Choose options:
   - Include photos (yes/no)
   - Include measurements (yes/no)
   - Include appendices (yes/no)
5. Click "Download"

### ✅ 4-Stage Approval Workflow

**All inspection reports go through 4 stages:**

#### Stage 1: Inspector Review (Self-Check)
- **Who:** Original inspector
- **Tasks:**
  - Verify data accuracy
  - Check photo quality
  - Confirm all measurements recorded
  - Review findings descriptions
- **Actions:** Submit or Return to Draft

#### Stage 2: Engineer Review (Technical Approval)
- **Who:** Assigned engineer
- **Tasks:**
  - Technical assessment of findings
  - Severity validation
  - Create work requests in SAP
  - Add engineering recommendations
- **Actions:** Approve, Reject, or Request Changes

**Creating Work Requests:**
1. Click "Create Work Request" in report
2. Select work type:
   - Corrective Maintenance
   - Preventive Maintenance
   - Inspection Follow-up
3. Enter work description
4. Set priority
5. Estimate resources needed
6. Submit to SAP (integration)

#### Stage 3: RBI Auditor Review (Compliance Check)
- **Who:** RBI auditor
- **Tasks:**
  - Verify RBI compliance
  - Check against guidelines
  - Quality audit
  - Final technical review
  - Lock report (immutable)
- **Actions:** Approve, Reject, or Request Audit

**RBI Compliance Checks:**
- ✓ Inspection method appropriate
- ✓ Frequency meets requirements
- ✓ All required data collected
- ✓ Findings properly classified
- ✓ Recommendations align with risk

#### Stage 4: Team Leader Final Approval
- **Who:** Team leader
- **Tasks:**
  - Overall review
  - Business approval
  - Final sign-off
  - Archive report
- **Actions:** Approve or Reject

**Status Indicators:**
- 🟡 Pending (yellow)
- 🔵 In Review (blue)
- 🟢 Approved (green)
- 🔴 Rejected (red)
- ⚪ Draft (gray)

### 🔧 Work Request Management

**Integration with SAP (configured separately)**

**Work Request Lifecycle:**
1. Engineer creates WR from inspection finding
2. WR synced to SAP
3. Maintenance team receives notification
4. Work scheduled and executed
5. Completion feedback to InspectionAgent

**Viewing Work Requests:**
1. Navigate to "Work Requests"
2. Filter by:
   - Status (open, in progress, completed, closed)
   - Priority (low, medium, high, critical)
   - Asset
   - Date range
3. Click WR to view details

**Work Request Details:**
- WR Number (SAP reference)
- Related inspection report
- Asset information
- Work description
- Priority and deadline
- Assigned maintenance team
- Status updates
- Completion notes

### 📊 RBI (Risk-Based Inspection) Module

**Purpose:** Ensure inspections comply with industry RBI standards

**Features:**
- RBI guidelines library
- Compliance scoring
- Risk assessment
- Audit trails
- Exception management

**RBI Guidelines:**
1. Go to "RBI" → "Guidelines"
2. Browse by:
   - Asset type
   - Industry standard (API, ASME, etc.)
   - Inspection method
3. View guideline details
4. Download PDF versions

**RBI Compliance Dashboard:**
- Overall compliance rate
- Non-compliant inspections
- Upcoming audits
- Exception requests
- Risk heat map

**Creating RBI Exceptions:**
(When standard procedure cannot be followed)
1. Navigate to "RBI" → "Exceptions"
2. Click "Request Exception"
3. Enter:
   - Asset and inspection reference
   - Reason for exception
   - Alternative approach proposed
   - Risk assessment
   - Approval needed from
4. Submit for review

### 📈 Dashboard & Analytics

**Executive Dashboard:**
- Total inspections (YTD)
- Completion rate vs. target
- Average inspection time
- Critical findings count
- Work requests created
- Team utilization rate

**Charts & Visualizations:**
- Pie chart: Inspections by status
- Bar chart: Inspections by facility
- Line chart: Trend over time
- Heat map: Asset criticality distribution

**Custom Reports:**
1. Go to "Analytics" → "Custom Reports"
2. Click "Create Report"
3. Select:
   - Date range
   - Facilities
   - Asset types
   - Metrics to include
4. Generate report
5. Schedule automatic delivery (optional)

**Scheduled Reports:**
- Daily summary (sent at 8 AM)
- Weekly team report (sent Monday)
- Monthly management report (sent 1st of month)
- Quarterly compliance report

### 🚨 Escalation System

**Automatic Escalations Triggered By:**
- Overdue inspections (7+ days past due)
- Critical findings not addressed (48 hours)
- Reports stuck in approval (5+ days)
- Multiple rejections (3+ times)
- RBI non-compliance

**Escalation Levels:**
1. **Level 1:** Email to inspector + supervisor
2. **Level 2:** Email to team leader + manager
3. **Level 3:** Email to department head
4. **Level 4:** Executive notification

**Handling Escalations:**
1. Go to "Escalations" dashboard
2. View active escalations
3. Click escalation to see details
4. Take corrective action
5. Add resolution notes
6. Close escalation

### 🔔 Notifications

**You receive notifications for:**
- New inspection assignments
- Report approval/rejection
- Work request updates
- Escalations
- Team announcements
- System updates

**Notification Channels:**
- In-app notifications (bell icon)
- Email notifications
- SMS (for critical items only)

**Managing Notifications:**
1. Click bell icon (top right)
2. View all notifications
3. Click to view details
4. Mark as read
5. Configure preferences in Settings

### ⚙️ Admin Panel

**(Admin users only)**

**User Management:**
1. Navigate to "Admin" → "Users"
2. View all users
3. Create new user:
   - Email
   - Full name
   - Role
   - Department
   - Phone
4. Edit user details
5. Deactivate/Activate users
6. Reset passwords

**System Settings:**
- Application name and logo
- Email server configuration
- SAP integration settings
- Backup schedule
- Session timeout
- Password policies

**Audit Logs:**
- View all system activities
- Filter by:
  - User
  - Action type
  - Date range
  - Module
- Export audit reports
- Immutable log storage

**System Health:**
- Database status
- API response times
- Storage usage
- Active users
- Background job status
- Error logs

---

## Workflows

### Workflow 1: Annual Planning to Inspection

**Step-by-Step Process:**

1. **Team Leader creates Annual Plan** (January)
   - Define year objectives
   - Allocate budget
   - Select assets for inspection
   - Set targets

2. **Team Leader breaks down into Quarterly Plans** (End of each quarter)
   - Q1: January-March
   - Q2: April-June
   - Q3: July-September
   - Q4: October-December

3. **Team Leader creates Monthly Plans** (Beginning of each month)
   - Specific tasks for the month
   - Assign to inspectors
   - Set daily schedules

4. **Inspector receives assignment** (notification)
   - Reviews asset details
   - Plans site visit
   - Prepares equipment

5. **Inspector conducts inspection** (on-site)
   - Follows checklist
   - Documents findings
   - Takes photos
   - Records measurements

6. **Inspector submits report** (same day or next day)
   - Auto-generated from inspection data
   - Reviews for accuracy
   - Submits for approval

7. **Approval workflow** (3-5 days typical)
   - Inspector self-review
   - Engineer technical review + WR creation
   - RBI auditor compliance check
   - Team leader final approval

8. **Work executed** (based on priority)
   - Maintenance team receives WR
   - Work scheduled
   - Repairs completed
   - Feedback loop to InspectionAgent

### Workflow 2: Critical Finding Response

**When critical finding is discovered:**

1. **Inspector immediately:**
   - Document finding thoroughly
   - Take multiple photos
   - Mark as "Critical" severity
   - Add detailed notes
   - Submit report immediately (don't wait)

2. **System automatically:**
   - Sends urgent notification to all approvers
   - Flags report as high priority
   - Creates escalation timer (24 hours)

3. **Engineer reviews within 4 hours:**
   - Assesses technical severity
   - Creates emergency work request
   - Determines if equipment should be isolated
   - Contacts operations if immediate action needed

4. **RBI Auditor fast-tracks review:**
   - Verifies finding is properly classified
   - Checks safety implications
   - Approves expedited

5. **Team Leader final approval:**
   - Business decision on equipment status
   - Coordinates with operations
   - Approves emergency work

6. **Emergency Work Request:**
   - Priority: Critical
   - Response time: Immediate
   - Safety implications flagged
   - Maintenance team notified immediately

**Timeline for Critical Findings:**
- ⏰ Discovery to report submission: 2 hours
- ⏰ Engineer review: 4 hours
- ⏰ RBI review: 8 hours
- ⏰ Final approval: 24 hours
- ⏰ Work start: 48 hours maximum

### Workflow 3: RBI Compliance Audit

**Quarterly RBI Compliance Review:**

1. **RBI Auditor generates audit report** (beginning of month after quarter)
   - Lists all inspections in quarter
   - Compliance status for each
   - Non-compliant inspections flagged

2. **Auditor reviews non-compliant items:**
   - Checks if exception was requested
   - Verifies documentation
   - Assesses risk

3. **Auditor creates action items:**
   - Re-inspection required?
   - Additional training needed?
   - Guidelines need update?

4. **Auditor schedules follow-up:**
   - 30-day review
   - Verify corrective actions completed
   - Update compliance status

5. **Auditor presents to management:**
   - Quarterly compliance report
   - Trends and improvements
   - Recommendations

---

## Mobile Usage

### Mobile-Optimized Features

**The app is fully responsive and works on:**
- iOS tablets (iPad)
- Android tablets
- iOS phones (iPhone)
- Android phones

**Best Experience:**
- Minimum 375px width (iPhone SE and larger)
- Recommended: Tablets 768px+ for full features
- Portrait or landscape orientation supported

### Mobile Navigation

**Bottom Navigation Bar** (5 tabs):
1. 🏠 Home - Dashboard
2. 📋 Assets - Asset list
3. ✓ Inspections - My assignments
4. 📝 Reports - My reports
5. 👤 Profile - Settings

**Gestures:**
- **Swipe left/right** - Navigate between tabs
- **Pull down** - Refresh page
- **Long press** - Context menu (where applicable)
- **Pinch to zoom** - On photos
- **Tap and hold** - Select multiple items

### Conducting Inspections on Mobile

**Before Going to Field:**
1. Open app on tablet/phone
2. Go to "Inspections" tab
3. Find today's assignments
4. Download offline (if needed)
5. Review asset details and location

**At the Site:**
1. Open assigned inspection
2. Tap "Start Inspection"
3. Work through checklist:
   - Tap each item to mark complete
   - Swipe to mark N/A
4. Add findings:
   - Tap "+" button
   - Camera opens automatically
   - Take photo
   - Add description using voice-to-text
5. Record measurements:
   - Tap measurement type
   - Enter value
   - Auto-saves

**Tips for Mobile Use:**
- **Turn on camera permissions** for photo capture
- **Enable location services** for geo-tagging
- **Use stylus** for signatures
- **Enable offline mode** for remote locations
- **Charge device fully** before field work
- **Bring power bank** for long days

### Offline Mode

**How it works:**
1. App automatically detects offline
2. All data saved locally on device
3. Continue working normally
4. When back online, data syncs automatically

**What works offline:**
- ✅ View assigned inspections
- ✅ Complete checklists
- ✅ Add findings and notes
- ✅ Take photos
- ✅ Record measurements
- ✅ Save drafts
- ❌ Submit reports (requires online)
- ❌ Download new assignments
- ❌ View other users' data

**Sync Status:**
- 🟢 Green dot: Fully synced
- 🟡 Yellow dot: Syncing...
- 🔴 Red dot: Sync pending (offline)

**To enable offline mode:**
1. Go to Profile → Settings
2. Enable "Offline Mode"
3. Select inspections to download
4. Wait for download to complete
5. Airplane mode safe to use

### Camera Best Practices

**Taking Good Inspection Photos:**

1. **Lighting:**
   - Use natural light when possible
   - Avoid direct sunlight (causes glare)
   - Use flashlight for dark areas
   - Take multiple angles

2. **Framing:**
   - Include reference objects (ruler, coin)
   - Show overall view + close-up
   - Capture location context
   - Include asset tag in frame

3. **Quality:**
   - Hold device steady
   - Clean camera lens first
   - Use highest resolution
   - Avoid digital zoom (move closer instead)

4. **Organization:**
   - Caption each photo immediately
   - Link to specific finding
   - Number sequential photos (1 of 3, 2 of 3, etc.)
   - Delete duplicates/blurry photos

---

## Troubleshooting

### Common Issues & Solutions

#### Login Problems

**Issue:** "Invalid email or password"
- **Solution:**
  - Check email is correct (yourname@adnoc.ae)
  - Verify Caps Lock is off
  - Try password reset
  - Contact admin if account locked

**Issue:** "Account is inactive"
- **Solution:**
  - Contact system administrator
  - Your account may need activation

**Issue:** Login works but page is blank
- **Solution:**
  - Clear browser cache (Ctrl+Shift+Delete)
  - Try different browser
  - Check internet connection

#### Data Not Loading

**Issue:** Assets/Inspections not showing
- **Solution:**
  - Refresh page (F5)
  - Check internet connection
  - Verify you have permissions
  - Try logging out and back in

**Issue:** Photos not uploading
- **Solution:**
  - Check file size (max 10MB per photo)
  - Verify internet speed
  - Compress photos if too large
  - Try uploading one at a time

#### Inspection Submission Errors

**Issue:** "Cannot submit - incomplete checklist"
- **Solution:**
  - Review all checklist items
  - Ensure 100% completion
  - Mark N/A for non-applicable items
  - Check for required fields

**Issue:** "Error saving data"
- **Solution:**
  - Check internet connection
  - Try saving as draft first
  - Log out and log back in
  - Contact support if persists

#### Mobile App Issues

**Issue:** App crashes on startup
- **Solution:**
  - Clear app cache
  - Restart device
  - Update to latest version
  - Reinstall app

**Issue:** Camera not working
- **Solution:**
  - Check camera permissions in device settings
  - Restart app
  - Try device camera app (test if hardware works)
  - Use photo upload instead

**Issue:** Offline sync not working
- **Solution:**
  - Connect to Wi-Fi
  - Check sync status icon
  - Force sync: Settings → Sync Now
  - Clear cache and re-download

### Performance Issues

**Slow Loading:**
1. Clear browser cache
2. Disable browser extensions
3. Close unnecessary tabs
4. Check internet speed
5. Try during off-peak hours

**App is laggy:**
1. Reduce photo resolution
2. Clear completed items from local storage
3. Delete old drafts
4. Restart app/browser
5. Update to latest version

### Getting Help

**In-App Support:**
1. Click Help icon (?)
2. Search knowledge base
3. Submit support ticket
4. Include:
   - What you were doing
   - Error message (screenshot)
   - Device/browser info
   - Date and time

**Contact Information:**
- **IT Support:** itsupport@adnoc.ae
- **System Admin:** admin@adnoc.ae
- **Phone:** +971-2-XXX-XXXX (internal: XXXX)
- **Hours:** Sunday-Thursday, 8 AM - 5 PM

**Emergency Issues:**
(System down, critical data loss)
- **24/7 Hotline:** +971-2-XXX-XXXX
- **Emergency Email:** emergency.it@adnoc.ae

---

## Best Practices

### For Inspectors

**Before Inspection:**
- ☑ Review asset history
- ☑ Check previous findings
- ☑ Download inspection offline
- ☑ Charge device fully
- ☑ Test camera
- ☑ Prepare tools and equipment

**During Inspection:**
- ☑ Follow checklist systematically
- ☑ Document everything
- ☑ Take clear, well-lit photos
- ☑ Record accurate measurements
- ☑ Note any deviations from standard
- ☑ Save draft frequently

**After Inspection:**
- ☑ Review all data for completeness
- ☑ Submit report same day if possible
- ☑ Follow up on critical findings
- ☑ Clean and store equipment
- ☑ Update availability calendar

### For Engineers

**Report Review:**
- ☑ Review within 24 hours of submission
- ☑ Verify technical accuracy
- ☑ Check severity classifications
- ☑ Create work requests promptly
- ☑ Add clear recommendations
- ☑ Document any discussions with inspector

**Work Request Creation:**
- ☑ Detailed work description
- ☑ Accurate priority assignment
- ☑ Realistic completion timeline
- ☑ All safety considerations noted
- ☑ Required materials/tools listed
- ☑ Follow-up inspection scheduled if needed

### For Team Leaders

**Planning:**
- ☑ Plan 2-4 weeks in advance
- ☑ Balance workload across team
- ☑ Consider inspector skills/experience
- ☑ Coordinate with operations
- ☑ Build in buffer time
- ☑ Review and adjust monthly

**Team Management:**
- ☑ Hold weekly team meetings
- ☑ Review KPIs regularly
- ☑ Provide feedback and coaching
- ☑ Address issues promptly
- ☑ Recognize good performance
- ☑ Maintain open communication

### For RBI Auditors

**Compliance:**
- ☑ Stay current with guidelines
- ☑ Audit sample of inspections
- ☑ Document all findings
- ☑ Provide training when needed
- ☑ Update guidelines as standards evolve
- ☑ Generate quarterly reports

### Data Quality

**Everyone's Responsibility:**
- ☑ Enter data accurately
- ☑ Use standardized terminology
- ☑ Complete all required fields
- ☑ Proofread before submitting
- ☑ Use measurement units consistently
- ☑ Report errors immediately

### Security Best Practices

**Protect Your Account:**
- ☑ Never share your password
- ☑ Use strong password (8+ characters, mixed case, numbers)
- ☑ Change password every 90 days
- ☑ Log out when away from device
- ☑ Don't save password on shared computers
- ☑ Report suspicious activity

**Protect Company Data:**
- ☑ Don't photograph sensitive areas
- ☑ Don't share reports externally
- ☑ Don't email inspection data to personal accounts
- ☑ Encrypt device if storing inspection data
- ☑ Follow ADNOC data security policies

---

## Keyboard Shortcuts

**Navigation:**
- `Alt + H` - Home/Dashboard
- `Alt + A` - Assets
- `Alt + I` - Inspections
- `Alt + R` - Reports
- `Alt + P` - Profile

**Actions:**
- `Ctrl + S` - Save draft
- `Ctrl + Enter` - Submit
- `Esc` - Close dialog/Cancel
- `Ctrl + F` - Search
- `F5` - Refresh

**Forms:**
- `Tab` - Next field
- `Shift + Tab` - Previous field
- `Space` - Check/uncheck checkbox
- `Enter` - Submit form

---

## Glossary

**AIP** - Annual Inspection Plan: Yearly high-level inspection strategy

**Asset** - Any equipment or structure requiring inspection (tanks, vessels, piping, etc.)

**Asset Code** - Unique identifier for each asset (e.g., TK-101)

**Checklist** - Pre-defined list of inspection points specific to asset type

**Criticality** - Risk level of asset: Low, Medium, High, Critical

**Finding** - Any defect, anomaly, or issue discovered during inspection

**MIP** - Monthly Inspection Plan: Detailed monthly execution plan

**QIP** - Quarterly Inspection Plan: 3-month tactical plan

**RBI** - Risk-Based Inspection: Industry standard approach to inspection planning

**Work Request (WR)** - Formal request for maintenance or repair work

**Workflow** - Sequence of approval stages for inspection reports

---

## FAQ

**Q: Can I edit a submitted report?**
A: No, once submitted, reports cannot be edited. If changes are needed, the approver must reject it and return it to draft status.

**Q: How long are inspection reports stored?**
A: All reports are stored permanently for regulatory compliance and audit purposes.

**Q: Can I use the app without internet?**
A: Yes, enable offline mode to conduct inspections without internet. Data syncs automatically when you're back online.

**Q: Who can see my inspection reports?**
A: Your reports are visible to your team leader, assigned engineers, RBI auditors, and administrators. Other inspectors cannot see your reports.

**Q: How often should I change my password?**
A: Every 90 days, as per ADNOC security policy.

**Q: Can I export inspection data to Excel?**
A: Yes, admins and team leaders can export data to Excel for analysis.

**Q: What happens if I submit a report with incomplete data?**
A: The system prevents submission if required fields are missing. You'll see a validation error listing what needs to be completed.

**Q: Can I reassign an inspection to another inspector?**
A: Only team leaders can reassign inspections. Contact your team leader if needed.

**Q: How do I handle emergency situations during inspection?**
A: For immediate safety concerns, follow ADNOC emergency procedures first. Document in the system afterward.

**Q: Are photos backed up?**
A: Yes, all photos are automatically backed up to ADNOC servers. Originals are also stored locally for 30 days.

---

## Appendices

### Appendix A: Asset Type Codes

| Code | Description |
|------|-------------|
| TK | Tank |
| VES | Pressure Vessel |
| COL | Column |
| HX | Heat Exchanger |
| PMP | Pump |
| COMP | Compressor |
| PIPE | Pipeline/Piping |
| VALVE | Valve |
| STRUCT | Structure |

### Appendix B: Finding Severity Guidelines

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Immediate safety risk, equipment must be isolated | 24 hours |
| **High** | Significant defect, potential failure imminent | 7 days |
| **Medium** | Notable issue, should be addressed in next shutdown | 30 days |
| **Low** | Minor issue, monitor and plan for future repair | 90 days |

### Appendix C: ADNOC Facilities Covered

1. Abu Dhabi Refinery
2. Ruwais Refinery Complex
3. Habshan Gas Processing
4. Jebel Dhanna Terminal
5. Das Island Facilities
6. Fujairah Refinery
7. Al Yasat Offshore Platform
8. ADNOC Offshore Operations

### Appendix D: Compliance Standards

- API 510: Pressure Vessel Inspection Code
- API 570: Piping Inspection Code
- API 653: Tank Inspection, Repair, Alteration, and Reconstruction
- ASME Section VIII: Pressure Vessel Code
- NACE: Corrosion Standards
- Local UAE regulations

---

## Document Information

**Document Version:** 1.0.0
**Last Updated:** January 13, 2026
**Prepared By:** InspectionAgent Development Team
**Reviewed By:** ADNOC IT Department
**Approved By:** Head of Inspection Services

**Change Log:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-01-13 | Initial release | Development Team |

---

## Support & Feedback

**We value your feedback!**

Help us improve InspectionAgent by:
- Reporting bugs or issues
- Suggesting new features
- Sharing best practices
- Providing user experience feedback

**Submit feedback:**
1. Click "Help" → "Feedback" in the app
2. Email: inspectionagent-feedback@adnoc.ae
3. Monthly user survey (check your email)

**Training Resources:**
- Video tutorials: [internal portal]/inspectionagent/videos
- Quick reference guides: [internal portal]/inspectionagent/guides
- Webinar recordings: [internal portal]/inspectionagent/webinars

---

**Thank you for using InspectionAgent!**

*This system helps ensure the safety, reliability, and compliance of ADNOC's critical infrastructure. Your diligent use of this tool contributes to operational excellence.*

**Together, we maintain world-class standards in inspection management.**

---

*For the latest version of this guide, visit the Help section in the application.*
