# GitHub Project Setup Guide

## Projects

The workflow processes all projects listed in the `PROJECTS` repository variable. Each entry is an `owner:project_number` pair, e.g.:

```
dgutierr-org:1 another-org:3
```

Repeat the steps below for **every project** you add to the list.

---

## Required fields

The workflow reads and writes specific fields on each project item. All field names are **case-sensitive** and must match exactly.

### Tracked fields (read by the workflow)

Changes to any of these fields trigger an update to `Reporting Date` and a new entry in `Reporting Log`.

| Field name           | Type          | Notes                                                                                     |
|----------------------|---------------|-------------------------------------------------------------------------------------------|
| `Status`             | Single select | e.g. Backlog, In Progress, Done                                                           |
| `Priority`           | Single select | e.g. Low, Medium, High                                                                    |
| `Estimate`           | Number        | Estimated effort in weeks (e.g. `2` = 2 weeks, `0.4` = 2 days, `0.1` = 4 hours)         |
| `Remaining Work`     | Number        | Remaining effort in weeks                                                                 |
| `Time Spent`         | Number        | Time already spent in weeks                                                               |
| `External Reference` | Text          | Optional: ticket ID in the configured JIRA instance (e.g. `SRVLOGIC-774`). When set, changes are synced to JIRA at `<JIRA_BASE_URL>/browse/<ID>` |

### Workflow-managed fields (written by the workflow)

These fields are updated automatically and should not be edited manually.

| Field name       | Type   | Purpose                                                       |
|------------------|--------|---------------------------------------------------------------|
| `Reporting Date` | Date   | Set to today whenever a tracked field changes                 |
| `Reporting Log`  | Text   | Log of changes, newest entry first, max 5 entries             |

#### Reporting Log entry format

Entries are separated by ` | `, ordered **newest first**. Field values within each entry are separated by `, `:

```
DATE, Status, Priority, Estimate, Remaining Work, Time Spent
```

Multiple entries example (newest → oldest, max 5):
```
2026-03-03, In Progress, High, 8, 5, 3 | 2026-03-01, Backlog, High, 8, 8, 0
```

The oldest entry is automatically discarded when the log exceeds 5 entries.

---

## How to add a field to a project

1. Go to **`https://github.com/orgs/<org>/projects/<number>`**
2. Click **"+"** at the right end of the column headers → **"New field"**
3. Enter the field name exactly as shown in the table above (case-sensitive)
4. Select the correct type
5. Click **"Save"**

---

## Cleanup

If the `Reporting Hash` field was created during a previous version of this workflow, it is no longer needed and can be safely removed:

1. Go to the project **Settings → Fields**
2. Find `Reporting Hash` and delete it
