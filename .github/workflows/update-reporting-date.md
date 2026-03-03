# update-reporting-date workflow — Setup Guide

## What it does

Automatically sets the `Reporting date` field to today in the GitHub Project whenever any of the following fields are edited on a project item: **Status**, **Priority**, **Estimate**, **Remaining Work**, **Time Spent**.

No action is taken for changes to other fields or for repository issue changes.

> **Note:** The `projects_v2_item` event that triggers this workflow is only available for **organization-level projects**. The project must be owned by a GitHub organization (not a personal account). This workflow is configured for `https://github.com/orgs/dgutierr-org/projects/1`.

---

## Setup

### 1. Create a Personal Access Token (PAT)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g. `secret-santa-project-automation`)
4. Under **Scopes**, check both:
   - **`project`** — grants read/write access to GitHub Projects v2
   - **`read:org`** — required to access organization-level project data
5. Click **"Generate token"** and **copy it immediately** (you won't see it again)

> Why not use the default `GITHUB_TOKEN`? That token is automatically created per workflow run and is scoped to the repository only. It cannot read or write fields on organization-level GitHub Projects v2.

### 2. Store the token as a repository secret

1. Go to your repository: **`secret-santa-application` → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Set:
   - **Name**: `GH_TOKEN` (exactly as referenced in the workflow)
   - **Secret**: paste the token you copied above
4. Click **"Add secret"**

### 3. Link the repository to the organization project

The `projects_v2_item` event only fires for projects that the repository is associated with. To link it:

1. Go to **`https://github.com/orgs/dgutierr-org/projects/1`**
2. Open the project **Settings → Manage access**
3. Add the `secret-santa-application` repository, or add it from the issue/PR side panel inside the project

---

Once all three steps are done, the workflow will trigger automatically whenever a tracked field is edited in the project.
