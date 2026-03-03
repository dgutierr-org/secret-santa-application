# track-reporting-date workflow — Setup Guide

## What it does

Runs **daily at 05:00 UTC** and checks **all** project items. For each item it compares the current values of the five tracked fields (**Status**, **Priority**, **Estimate**, **Remaining Work**, **Time Spent**) against the last entry in the item's **`Reporting Log`** field. If a change is detected (or the log is empty), the workflow:

1. Sets **`Reporting Date`** to today
2. Prepends a new entry to **`Reporting Log`** in the format:
   ```
   YYYY-MM-DD, Status, Priority, Estimate, Remaining Work, Time Spent
   ```

No action is taken when non-tracked fields change (e.g. title, assignee).

---

## Setup

### 1. Add the required fields to the project

In **`https://github.com/orgs/dgutierr-org/projects/1`**, make sure the following fields exist:

| Field name       | Type   | Purpose                                                        |
|------------------|--------|----------------------------------------------------------------|
| `Reporting Date` | Date   | Set to today when a tracked field changes                      |
| `Reporting Log`  | Text   | Log of tracked field values, newest entry first, max 5 entries |

### 2. Create a Personal Access Token (PAT)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g. `secret-santa-project-automation`)
4. Under **Scopes**, check both:
   - **`project`** — grants read/write access to GitHub Projects v2
   - **`read:org`** — required to access organization-level project data
5. Click **"Generate token"** and **copy it immediately** (you won't see it again)

> Why not use the default `GITHUB_TOKEN`? That token is automatically created per workflow run and is scoped to the repository only. It cannot read or write fields on organization-level GitHub Projects v2.

### 3. Store the token as a repository secret

1. Go to your repository: **`secret-santa-application` → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Set:
   - **Name**: `GH_TOKEN` (exactly as referenced in the workflow)
   - **Secret**: paste the token you copied above
4. Click **"Add secret"**

---

Once all steps are done, the workflow will run automatically every day at 05:00 UTC and update `Reporting Date` and `Reporting Log` whenever a tracked field has changed since the last run.
