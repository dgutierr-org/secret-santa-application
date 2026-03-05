# track-reporting-date workflow — Testing Guide

## Prerequisites

Make sure the setup from the guide is complete:
- `GH_TOKEN` secret is set in the repository (PAT with `project` and `read:org` scopes)
- `PROJECTS` variable is set (e.g. `dgutierr-org:1`) — **Settings → Secrets and variables → Actions → Variables**
- `JIRA_BASE_URL` variable is set (e.g. `https://issues.redhat.com`) — same location
- Each project in `PROJECTS` has both a **`Reporting Date`** (Date) and a **`Reporting Log`** (Text) field

To also test JIRA sync:
- `JIRA_API_TOKEN` secret is set in the repository (JIRA Personal Access Token)
- The project has an **`External Reference`** (Text) field
- At least one project item has a valid JIRA ticket ID in `External Reference` (e.g. `SRVLOGIC-774`)

---

## Testing steps

1. **Go to a project** listed in your `PROJECTS` variable

2. **Pick any issue/item** in the project and change one of the tracked fields:
   - Status, Priority, Estimate, Remaining Work, or Time Spent

3. **Wait until 05:00 UTC** for the scheduled workflow to trigger, or use the manual trigger below to run it immediately

4. **Check the workflow ran** → go to your repository → **Actions** tab → open the latest run of `Track Reporting Date on Field Changes` and inspect the logs. You should see:
   - A `========` header per project with the org and project number
   - The item listed with a change detected and an update confirmation
   - A per-project summary and a grand total at the end

5. **Verify the result** → go back to the project item and confirm:
   - `Reporting Date` is set to today
   - `Reporting Log` has a new entry prepended in the format `YYYY-MM-DD, Status, Priority, Estimate, Remaining Work, Time Spent`, separated from older entries by ` | `, with a maximum of 5 entries total

6. **Verify JIRA sync (if configured)** → open the JIRA ticket referenced in `External Reference` and confirm:
   - **Priority** matches the value set in the project item
   - **Original Estimate** matches the `Estimate` value
   - **Remaining Estimate** matches the `Remaining Work` value
   - A worklog entry has been added or updated with a comment like `Copied time spent from GH #<issue>` or `Increased time spent from GH #<issue>`

---

## Manual trigger (skip the scheduled wait)

1. Go to **Actions → Track Reporting Date on Field Changes → Run workflow**
2. Click **"Run workflow"**
3. The workflow runs immediately against all projects in `PROJECTS`

---

## Negative test (optional)

Change a field that is **not** in the tracked list (e.g. title or assignee). After the next workflow run, the logs should show the item was processed but skipped with `No change detected. Skipping.`

---

## Troubleshooting

- **Workflow fails with auth error** → the `GH_TOKEN` secret is missing or the PAT doesn't have `project` and `read:org` scopes
- **No projects processed / empty run** → the `PROJECTS` variable is not set or is empty; go to **Settings → Secrets and variables → Actions → Variables** and verify it exists
- **`PROJECTS` variable not found** → make sure it is defined as a **Variable** (not a secret) in the repository or organization settings
- **`JIRA_BASE_URL` variable not found** → same as above; JIRA sync will produce empty URLs if not set
- **`Reporting Date` field not found** → the field name in the project doesn't exactly match `Reporting Date` (case-sensitive); the project is skipped and processing continues with the next one
- **`Reporting Log` field not found** → the field name in the project doesn't exactly match `Reporting Log` (case-sensitive), or the field hasn't been created yet; same skip behaviour
- **Item not processed** → the workflow paginates automatically (100 items per page); check the Actions log to see how many pages were fetched and confirm the item's page was processed
- **Project in a different org not processed** → the PAT owner must be a member of that org, and for orgs with SAML SSO the PAT must be authorized for that org via **GitHub → Settings → Personal access tokens → Configure SSO → Authorize**
- **JIRA update failed (HTTP 401)** → `JIRA_API_TOKEN` secret is missing, expired, or not a valid JIRA Personal Access Token (PAT); basic auth credentials will not work — a PAT is required
- **JIRA update failed (HTTP 404)** → the ticket ID in `External Reference` does not exist or is not accessible with the provided credentials
- **JIRA update failed (HTTP 400)** → a field value is in an unexpected format (e.g. Priority name doesn't match a valid JIRA priority, or time values are not in JIRA format such as `2h`, `1d`)
