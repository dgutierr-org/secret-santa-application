# update-reporting-date workflow — Testing Guide

## Prerequisites

Make sure the setup from the guide is complete:
- `GH_TOKEN` secret is set in the repository (PAT with `project` and `read:org` scopes)
- The project (`https://github.com/orgs/dgutierr-org/projects/1`) has both a **`Reporting Date`** (Date) and a **`Reporting Hash`** (Text) field

---

## Testing steps

1. **Go to your project** → `https://github.com/orgs/dgutierr-org/projects/1`

2. **Pick any issue/item** in the project and change one of the tracked fields:
   - Status, Priority, Estimate, Remaining Work, or Time Spent

3. **Wait up to 5 minutes** for the scheduled workflow to trigger

4. **Check the workflow ran** → go to your repository → **Actions** tab → open the latest run of `Update Reporting Date on Project Item Changes` and inspect the logs. You should see the item listed with a hash mismatch and an update confirmation.

5. **Verify the result** → go back to the project item and confirm:
   - `Reporting Date` is set to today
   - `Reporting Hash` has been updated to a new SHA-256 value

---

## Manual trigger (skip the 2-minute wait)

1. Go to **Actions → Update Reporting Date on Project Item Changes → Run workflow**
2. Click **"Run workflow"**
3. The workflow runs immediately against the latest project state

---

## Negative test (optional)

Change a field that is **not** in the tracked list (e.g. title or assignee). After the next workflow run, the logs should show the item was processed but skipped with `Hashes match — no tracked field changed`.

---

## Troubleshooting

- **Workflow fails with auth error** → the `GH_TOKEN` secret is missing or the PAT doesn't have `project` and `read:org` scopes
- **`Reporting Date` field not found** → the field name in the project doesn't exactly match `Reporting Date` (case-sensitive)
- **`Reporting Hash` field not found** → the field name in the project doesn't exactly match `Reporting Hash` (case-sensitive), or the field hasn't been created yet
- **Item not processed** → the item's `updatedAt` timestamp fell outside the 6-minute lookback window; trigger the workflow manually to force a full check
