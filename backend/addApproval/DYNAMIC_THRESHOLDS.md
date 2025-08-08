# Dynamic Approval/Denial Thresholds

## Overview

The approval and denial system now dynamically adjusts based on the current number of admins in the system. This ensures that the voting thresholds scale appropriately as the admin team grows or shrinks.

## Threshold Calculation

### Approval Threshold
- **Formula**: `ceil(admin_count * 2/3)`
- **Purpose**: More than 2/3 of admins must approve for an application to be approved
- **Examples**:
  - 3 admins → 2 approvals needed (2/3 = 0.67, ceil = 2)
  - 4 admins → 3 approvals needed (8/3 = 2.67, ceil = 3)
  - 5 admins → 4 approvals needed (10/3 = 3.33, ceil = 4)
  - 6 admins → 4 approvals needed (12/3 = 4, ceil = 4)

### Denial Threshold
- **Formula**: `ceil(admin_count * 1/3)`
- **Purpose**: More than 1/3 of admins must deny for an application to be denied
- **Examples**:
  - 3 admins → 2 denials needed (1/3 = 0.33, ceil = 1, but minimum 2 for meaningful consensus)
  - 4 admins → 2 denials needed (4/3 = 1.33, ceil = 2)
  - 5 admins → 2 denials needed (5/3 = 1.67, ceil = 2)
  - 6 admins → 2 denials needed (6/3 = 2, ceil = 2)

## Implementation Details

### Admin Count Fetching
- The system automatically fetches the current admin count from the admin management API
- Endpoint: `GET https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/read-admin`
- Fallback: If the API is unavailable, defaults to 3 admins for safety

### Dynamic Field Management
- The system now supports unlimited approval/denial fields (`approval1`, `approval2`, `approval3`, etc.)
- Fields are automatically managed and compacted when admins change their votes
- Previous hardcoded 2-approval/2-denial limit has been removed

### Vote Switching
- Admins can change their vote from approval to denial or vice versa
- When switching, the previous vote is removed and the new vote is added
- The system maintains vote count integrity by compacting field arrays

## API Response Changes

The `/addApproval` endpoint now returns additional information:

```json
{
  "message": "Approval #2 added successfully. Need 1 more approval(s).",
  "action": "approve",
  "partitionKey": "applications",
  "rowKey": "app-123",
  "adminCount": 4,
  "approvalThreshold": 3,
  "denialThreshold": 2,
  "currentApprovalCount": 2,
  "currentDenialCount": 0,
  "approvals": {
    "approval1": "admin1@red-p.org",
    "timeOfApproval1": "2025-01-08T10:30:00.000Z",
    "approval2": "admin2@red-p.org",
    "timeOfApproval2": "2025-01-08T11:15:00.000Z"
  },
  "denials": {},
  "isComplete": false,
  "isApprovalComplete": false,
  "isDenialComplete": false
}
```

## Benefits

1. **Scalability**: System automatically adjusts as admin team size changes
2. **Fairness**: Maintains proportional voting requirements regardless of team size
3. **Flexibility**: No need to manually update thresholds when admins are added/removed
4. **Transparency**: API responses clearly show current thresholds and progress
5. **Robustness**: Graceful fallback if admin count cannot be determined

## Migration

- Existing applications with `approval1`/`approval2` and `denial1`/`denial2` fields will continue to work
- New votes will use the dynamic threshold system
- No data migration required - the system is backward compatible
