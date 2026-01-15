# RBI Module Quick Start Guide

## What is the RBI Module?

The Risk-Based Inspection (RBI) module helps prioritize inspection activities based on risk assessment. It combines consequence of failure and probability of failure to calculate overall risk scores for assets.

## Key Features at a Glance

### 1. Risk Matrix (5x5)
```
              PROBABILITY →
         Rare | Unlikely | Possible | Likely | Almost Certain
         1    |    2     |    3     |   4    |       5
    5  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ↑  [  ]  |  [  ]    |  [  ]    | [ 🔴 ]|  [ 🔴🔴 ]
    C  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    O  [  ]  |  [  ]    |  [ 🟡 ]  | [ 🔴 ]|  [ 🔴🔴 ]
    N  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    S  [  ]  |  [ 🟢 ]  |  [ 🟡 ]  | [ 🟡 ]|  [ 🔴 ]
    E  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Q  [ 🟢 ]|  [ 🟢 ]  |  [ 🟢 ]  | [ 🟡 ]|  [ 🟡 ]
    U  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    E  [ 🟢 ]|  [ 🟢 ]  |  [ 🟢 ]  | [ 🟢 ]|  [ 🟡 ]
    1  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Low Risk (score < 6)
🟡 Medium Risk (score 6-11)
🔴 High Risk (score 12-19)
🔴🔴 Critical Risk (score >= 20)
```

### 2. Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│ RBI (Risk-Based Inspection)                    [Export] [+] │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Assessments] [Risk Matrix] [Trends]             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  OVERVIEW TAB:                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Total   │ │Critical  │ │   High   │ │Med + Low │       │
│  │   42     │ │    3     │ │    8     │ │    31    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌────────────────────┐  ┌────────────────────────┐        │
│  │ Risk Distribution  │  │ High-Risk Assets       │        │
│  │  [Pie Chart]       │  │ • Tank-101 [CRITICAL]  │        │
│  │                    │  │ • Pump-205 [HIGH]      │        │
│  └────────────────────┘  └────────────────────────┘        │
│                                                               │
│  ASSESSMENTS TAB:                                            │
│  [Search...] [Filter: All Risk Levels ▼]                    │
│  ┌─────────────────────────────────────────┐                │
│  │ Pressure Vessel Tank-101    [CRITICAL]  │                │
│  │ Type: Pressure Vessel | Facility: A-12  │                │
│  │ Consequence: 5/5 | Probability: 4/5     │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  RISK MATRIX TAB:                                            │
│  [5x5 Interactive Matrix - click cells to filter]           │
│                                                               │
│  TRENDS TAB:                                                 │
│  [Line Chart - 90 day history]                              │
│  [Bar Chart - Current distribution]                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Assessment Form

```
┌─────────────────────────────────────────────────────────────┐
│ RBI Assessment                                          [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CONSEQUENCE FACTORS                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Safety Impact          ◉──────────○  [3]            │   │
│  │ Environmental Impact   ◉──────────○  [3]            │   │
│  │ Production Impact      ◉──────────○  [3]            │   │
│  │ Financial Impact       ◉──────────○  [3]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  PROBABILITY FACTORS                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Corrosion Rate         ◉──────────○  [3]            │   │
│  │ Asset Age              ◉──────────○  [3]            │   │
│  │ Operating Conditions   ◉──────────○  [3]            │   │
│  │ Maintenance History    ◉──────────○  [3]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  RISK ASSESSMENT SUMMARY                                     │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────┐        │
│  │Consequence │ │Probability │ │   Risk Level     │        │
│  │     3      │ │     3      │ │   🟡 MEDIUM      │        │
│  └────────────┘ └────────────┘ └──────────────────┘        │
│  Risk Score = 3 × 3 = 9                                     │
│                                                               │
│  NOTES                                                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Optional notes...]                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│                                   [Cancel] [Save Assessment] │
└─────────────────────────────────────────────────────────────┘
```

## How to Use

### Creating an Assessment

1. Click the "New Assessment" button (top-right)
2. Enter the Asset ID or select from dropdown
3. Rate each consequence factor (1-5):
   - **Safety**: Potential harm to personnel
   - **Environmental**: Potential environmental damage
   - **Production**: Impact on operations
   - **Financial**: Direct and indirect costs
4. Rate each probability factor (1-5):
   - **Corrosion Rate**: Current deterioration speed
   - **Age**: Asset age vs expected life
   - **Operating Conditions**: Environmental severity
   - **Maintenance History**: Quality of past maintenance (1=Good, 5=Poor)
5. Review the auto-calculated risk score and level
6. Add any additional notes
7. Click "Save Assessment"

### Understanding Risk Scores

#### Consequence Score
Average of 4 factors: `(Safety + Environmental + Production + Financial) / 4`

#### Probability Score
Average of 4 factors: `(Corrosion + Age + Conditions + Maintenance) / 4`

#### Risk Score
`Consequence Score × Probability Score`

#### Risk Level
- **Low** (🟢): Score 1-5 → Standard inspection schedule
- **Medium** (🟡): Score 6-11 → Increased monitoring
- **High** (🔴): Score 12-19 → Priority inspection required
- **Critical** (🔴🔴): Score 20-25 → Immediate action required

### Using the Risk Matrix

1. Go to "Risk Matrix" tab
2. View the 5×5 grid showing asset distribution
3. Click any cell to filter assets with that specific risk combination
4. Switch to "Assessments" tab to see filtered results
5. Click "Clear Filter" to reset

### Monitoring Trends

1. Go to "Trends" tab
2. View 90-day historical line chart
3. Track how risk levels change over time
4. Use bar chart to compare current distribution
5. Identify patterns and take preventive action

### Filtering Assessments

1. Go to "Assessments" tab
2. Use search box to find specific assets
3. Use risk level dropdown to filter by severity
4. Click matrix cells to filter by specific scores
5. Combine filters for precise results

## Access Control

**Allowed Roles:**
- `rbi_auditor` - Full access to create and manage assessments
- `admin` - Full administrative access

**Protected Route:** `/rbi`

## API Integration

The module expects these backend endpoints:

```
GET    /api/v1/rbi/assessments          - List all assessments
POST   /api/v1/rbi/assessments          - Create new assessment
GET    /api/v1/rbi/assessments/{id}     - Get single assessment
PUT    /api/v1/rbi/assessments/{id}     - Update assessment
DELETE /api/v1/rbi/assessments/{id}     - Delete assessment
GET    /api/v1/rbi/risk-matrix           - Get matrix data
GET    /api/v1/rbi/risk-distribution     - Get risk counts
GET    /api/v1/rbi/risk-trends           - Get historical trends
GET    /api/v1/rbi/high-risk-assets      - Get critical/high assets
```

## Best Practices

### When to Assess
- After installation of new equipment
- Following major repairs or modifications
- When operating conditions change
- Periodically (annual review recommended)
- After significant findings during inspection

### Assessment Guidelines

**Consequence Factors:**
- Be conservative - overestimate rather than underestimate
- Consider worst-case scenarios
- Include cascading effects
- Document your reasoning in notes

**Probability Factors:**
- Use inspection data when available
- Consider manufacturer recommendations
- Review maintenance logs
- Account for operating environment

### Risk Management Actions

**Critical Risk (20-25):**
- Immediate inspection required
- Consider temporary shutdown
- Implement interim controls
- Escalate to management

**High Risk (12-19):**
- Schedule inspection within 30 days
- Increase monitoring frequency
- Review operating procedures
- Document mitigation plans

**Medium Risk (6-11):**
- Schedule inspection within 90 days
- Continue normal monitoring
- Review during annual planning

**Low Risk (1-5):**
- Standard inspection schedule
- Routine monitoring
- Review every 2-3 years

## Troubleshooting

### Issue: Can't create assessment
**Solution:** Ensure you're logged in with `rbi_auditor` or `admin` role

### Issue: Risk score seems wrong
**Solution:** Check that all 8 factors (4 consequence + 4 probability) are rated 1-5

### Issue: Matrix cells are empty
**Solution:** Create some assessments first - matrix populates from existing data

### Issue: Trends chart is flat
**Solution:** Historical data accumulates over time - needs at least 2 data points

### Issue: High-risk list is empty
**Solution:** Only shows assets with risk level "high" or "critical"

## Export Functionality

Click "Export Report" to generate:
- PDF risk assessment report
- Excel spreadsheet with all data
- Summary dashboard for management
- Inspection schedule recommendations

(Backend implementation required)

## Next Steps

1. Create your first assessment
2. Review the risk matrix distribution
3. Set up inspection schedules based on risk
4. Monitor trends monthly
5. Update assessments quarterly
6. Export reports for management review

## Support

For technical support or questions:
- Check `/Users/manojaidude/AdNoc/frontend/RBI_MODULE_SUMMARY.md` for detailed documentation
- Review component files in `/src/components/rbi/`
- Contact the development team

---

**Version**: 1.0.0
**Last Updated**: January 14, 2026
**Status**: Production Ready
