# track-reporting-date workflow — Setup Guide

## What it does

Runs **daily at 05:00 UTC** and checks **all items across all configured projects**. For each item it compares the current values of the five tracked fields (**Status**, **Priority**, **Estimate**, **Remaining Work**, **Time Spent**) against the last entry in the item's **`Reporting Log`** field. If a change is detected (or the log is empty), the workflow:

1. Sets **`Reporting Date`** to today
2. Prepends a new entry to **`Reporting Log`** in the format:
   ```
   YYYY-MM-DD, Status, Priority, Estimate, Remaining Work, Time Spent
   ```

No action is taken when non-tracked fields change (e.g. title, assignee).

---

## Setup

### 1. Add the required fields to each project

In every GitHub Project you want to track, make sure the following fields exist:

| Field name       | Type   | Purpose                                                        |
|------------------|--------|----------------------------------------------------------------|
| `Reporting Date` | Date   | Set to today when a tracked field changes                      |
| `Reporting Log`  | Text   | Log of tracked field values, newest entry first, max 5 entries |

See the [GitHub Project Setup Guide](track-reporting-date-project-setup.md) for detailed instructions.

### 2. Create a Personal Access Token (PAT)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g. `secret-santa-project-automation`)
4. Under **Scopes**, check both:
   - **`project`** — grants read/write access to GitHub Projects v2
   - **`read:org`** — required to access organization-level project data
5. Click **"Generate token"** and **copy it immediately** (you won't see it again)

> Why not use the default `GITHUB_TOKEN`? That token is automatically created per workflow run and is scoped to the repository only. It cannot read or write fields on organization-level GitHub Projects v2.

The same PAT can access projects in multiple organizations as long as the token owner is a member of each org. For organizations with **SAML SSO**, the PAT must also be authorized for each org via **GitHub → Settings → Personal access tokens → Configure SSO → Authorize**.

### 3. Store the PAT as a repository secret

1. Go to your repository: **`secret-santa-application` → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Set:
   - **Name**: `GH_TOKEN` (exactly as referenced in the workflow)
   - **Secret**: paste the token you copied above
4. Click **"Add secret"**

### 4. Configure repository variables

The workflow reads its project list and JIRA host from **GitHub Actions Variables** (plaintext config, not secrets).

1. Go to **`secret-santa-application` → Settings → Secrets and variables → Actions → Variables tab**
2. Click **"New repository variable"** and add the following:

| Variable name  | Type     | Example value                          | Description |
|----------------|----------|----------------------------------------|-------------|
| `PROJECTS`     | Variable | `dgutierr-org:1 another-org:3`         | Space-separated list of `owner:project_number` pairs to process |
| `JIRA_BASE_URL`| Variable | `https://issues.redhat.com`            | Base URL of the JIRA instance (no trailing slash) |

**`PROJECTS` format:** each entry is `<org-login>:<project-number>`, separated by spaces. The project number is the integer shown in the project URL: `https://github.com/orgs/<org>/projects/<number>`.

Example with three projects across two organizations:
```
dgutierr-org:1 dgutierr-org:2 another-org:5
```

> **Tip:** Variables can also be defined at the **organization level** (org Settings → Secrets and variables → Actions → Variables) and shared across multiple repositories, which is useful if several repos run this same workflow against the same set of projects.

---

### 5. (Optional) Configure JIRA sync

If you want changes to be synced to JIRA tickets, add the `External Reference` field to each project (see the [GitHub Project Setup Guide](track-reporting-date-project-setup.md)) and store one additional secret:

| Secret name      | Value                                                                 |
|------------------|-----------------------------------------------------------------------|
| `JIRA_API_TOKEN` | A JIRA Personal Access Token (PAT) — generate one in JIRA at **Profile → Personal Access Tokens → Create token** |

To add the secret: **`secret-santa-application` → Settings → Secrets and variables → Actions → New repository secret**.

> **Note:** JIRA Data Center (e.g. `issues.redhat.com`) uses PAT-based Bearer token authentication. Basic auth (username + password/API key) is not supported.

When `External Reference` is set on a project item (e.g. `SRVLOGIC-774`), the workflow will:
- Update **Priority** and **time tracking** (Estimate → original estimate, Remaining Work → remaining estimate) on the JIRA ticket
- Keep **Time Spent** in sync by logging a worklog entry whose comment identifies it as workflow-managed (e.g. `Copied time spent from GH #42` or `Increased time spent from GH #42`)

The JIRA ticket URL is constructed as `<JIRA_BASE_URL>/browse/<External Reference>`.

If `JIRA_API_TOKEN` is not set, the JIRA sync step is skipped silently.

---

Once all steps are done, the workflow will run automatically every day at 05:00 UTC and update `Reporting Date` and `Reporting Log` whenever a tracked field has changed since the last run, across all projects listed in `PROJECTS`.

---

## Why cron instead of GitHub project events?

GitHub Actions does **not** natively support triggering workflows from GitHub Projects (v2) field changes. The available event triggers (`issues`, `pull_request`, `project_card`, etc.) only fire on classic Projects (v1) or on issue/PR metadata changes — not on custom project fields like `Status`, `Priority`, `Estimate`, etc.

The only way to react to custom project field changes in GitHub Actions is via the **GitHub GraphQL API**, which is only accessible by polling. Hence the scheduled cron approach:

1. The workflow runs on schedule and queries all project items via GraphQL.
2. For each item, it compares the current field values against the last entry in `Reporting Log`.
3. If anything changed since the last run, it updates `Reporting Date` and prepends a new entry to `Reporting Log`.

This is a known limitation of GitHub Projects v2 — there is no `project_field_changed` webhook or Actions trigger available.
