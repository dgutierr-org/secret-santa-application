# track-reporting-date workflow — Testing Guide

## Prerequisites

Make sure the setup from the guide is complete:
- `GH_TOKEN` secret is set in the repository (PAT with `project` and `read:org` scopes)
- The project (`https://github.com/orgs/dgutierr-org/projects/1`) has both a **`Reporting Date`** (Date) and a **`Reporting Log`** (Text) field

To also test JIRA sync:
- `JIRA_USER` and `JIRA_API_TOKEN` secrets are set in the repository
- The project has an **`External Reference`** (Text) field
- At least one project item has a valid JIRA ticket ID in `External Reference` (e.g. `SRVLOGIC-774`)

---

## Testing steps

1. **Go to your project** → `https://github.com/orgs/dgutierr-org/projects/1`

2. **Pick any issue/item** in the project and change one of the tracked fields:
   - Status, Priority, Estimate, Remaining Work, or Time Spent

3. **Wait until 05:00 UTC** for the scheduled workflow to trigger, or use the manual trigger below to run it immediately

4. **Check the workflow ran** → go to your repository → **Actions** tab → open the latest run of `Track Reporting Date on Field Changes` and inspect the logs. You should see the item listed with a change detected and an update confirmation.

5. **Verify the result** → go back to the project item and confirm:
   - `Reporting Date` is set to today
   - `Reporting Log` has a new entry prepended in the format `YYYY-MM-DD, Status, Priority, Estimate, Remaining Work, Time Spent`, separated from older entries by ` | `, with a maximum of 5 entries total

6. **Verify JIRA sync (if configured)** → open the JIRA ticket referenced in `External Reference` and confirm:
   - **Priority** matches the value set in the project item
   - **Original Estimate** matches the `Estimate` value
   - **Remaining Estimate** matches the `Remaining Work` value
   - A new **worklog entry** has been added with the `Time Spent` value

---

## Manual trigger (skip the scheduled wait)

1. Go to **Actions → Track Reporting Date on Field Changes → Run workflow**
2. Click **"Run workflow"**
3. The workflow runs immediately against the latest project state

---

## Negative test (optional)

Change a field that is **not** in the tracked list (e.g. title or assignee). After the next workflow run, the logs should show the item was processed but skipped with `No change detected. Skipping.`

---

## Troubleshooting

- **Workflow fails with auth error** → the `GH_TOKEN` secret is missing or the PAT doesn't have `project` and `read:org` scopes
- **`Reporting Date` field not found** → the field name in the project doesn't exactly match `Reporting Date` (case-sensitive)
- **`Reporting Log` field not found** → the field name in the project doesn't exactly match `Reporting Log` (case-sensitive), or the field hasn't been created yet
- **Item not processed** → the item may not appear in the first 100 results; increase the `items(first: 100)` limit in the workflow if the project has more than 100 items
- **JIRA update failed (HTTP 401)** → `JIRA_USER` or `JIRA_API_TOKEN` secret is missing or incorrect
- **JIRA update failed (HTTP 404)** → the ticket ID in `External Reference` does not exist or is not accessible with the provided credentials
- **JIRA update failed (HTTP 400)** → a field value is in an unexpected format (e.g. Priority name doesn't match a valid JIRA priority, or time values are not in JIRA format such as `2h`, `1d`)
