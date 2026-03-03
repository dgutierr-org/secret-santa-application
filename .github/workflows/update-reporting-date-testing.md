# update-reporting-date workflow — Testing Guide

## Prerequisites

Make sure the setup from the guide is complete:
- `GH_TOKEN` secret is set in the repository
- The repository is linked to your project (`https://github.com/users/dgutierr/projects/1`)
- The project has a **`Reporting date`** field of type **Date**

---

## Testing steps

1. **Merge the PR** (or enable Actions on the branch if GitHub allows it)

2. **Go to your project** → `https://github.com/users/dgutierr/projects/1`

3. **Pick any issue/item** in the project and change one of the tracked fields:
   - Status, Priority, Estimate, Remaining Work, or Time Spent

4. **Check the workflow ran** → go to your repository → **Actions** tab → you should see a run of `Update Reporting Date on Project Item Changes`

5. **Verify the result** → go back to the project item and confirm the `Reporting date` field was updated to today's date

---

## Negative test (optional)

Change a field that is **not** in the tracked list (e.g. a custom text field or the title). The workflow should either not trigger or be skipped — you'll see it listed in Actions with a grey "skipped" status.

---

## Troubleshooting

- **Workflow doesn't trigger at all** → the repository is likely not linked to the project, or the `projects_v2_item` event is not enabled
- **Workflow fails with auth error** → the `GH_TOKEN` secret is missing or the PAT doesn't have `project` scope
- **`Reporting date` field not found** → the field name in the project doesn't exactly match `Reporting date` (case-sensitive) — check the field name in the project settings
