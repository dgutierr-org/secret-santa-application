# update-reporting-date workflow — Setup Guide

## What it does

Automatically sets the `Reporting date` field to today in the GitHub Project whenever any of the following fields are edited on a project item: **Status**, **Priority**, **Estimate**, **Remaining Work**, **Time Spent**.

No action is taken for changes to other fields or for repository issue changes.

---

## Setup

### 1. Create a Personal Access Token (PAT)

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Give it a name (e.g. `secret-santa-project-automation`)
4. Under **Scopes**, check **`project`** — this grants read/write access to GitHub Projects v2
5. Click **"Generate token"** and **copy it immediately** (you won't see it again)

> Why not use the default `GITHUB_TOKEN`? That token is automatically created per workflow run and only has access to the repository itself. GitHub Projects (v2) at the user level are outside the repository scope, so the default token can't read or update project fields.

### 2. Store the token as a repository secret

1. Go to your repository: **`secret-santa-application` → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Set:
   - **Name**: `GH_TOKEN` (exactly as referenced in the workflow)
   - **Secret**: paste the token you copied above
4. Click **"Add secret"**

### 3. Verify the project is linked to the repository

Make sure the repository is added to your project (`https://github.com/users/dgutierr/projects/1`). The `projects_v2_item` event only fires for projects that the workflow's repository is associated with. You can check this in the project settings under **"Manage access"** or by simply adding the repo from the project's side panel.

---

Once all three steps are done, the workflow will trigger automatically whenever a tracked field is edited in the project.
