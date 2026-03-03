# update-reporting-date workflow — Setup Guide

## What it does

Runs every 5 minutes and checks all project items updated in the last 6 minutes. For each recently updated item it computes a SHA-256 hash of the five tracked fields (**Status**, **Priority**, **Estimate**, **Remaining Work**, **Time Spent**) and compares it against the value stored in the **`Reporting Hash`** field. If the hashes differ, one of the tracked fields has changed and **`Reporting Date`** is set to today. The new hash is then saved back to **`Reporting Hash`** for the next comparison.

No action is taken when non-tracked fields change (e.g. title, assignee).

---

## Setup

### 1. Add the required fields to the project

In **`https://github.com/orgs/dgutierr-org/projects/1`**, make sure the following fields exist:

| Field name       | Type   | Purpose                                      |
|------------------|--------|----------------------------------------------|
| `Reporting Date` | Date   | Set to today when a tracked field changes    |
| `Reporting Hash` | Text   | Stores the hash of the last known field state |

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

Once all steps are done, the workflow will run automatically every 5 minutes and update `Reporting Date` whenever a tracked field is changed.
