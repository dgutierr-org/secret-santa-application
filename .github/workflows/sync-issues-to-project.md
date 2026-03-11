# Sync Issues to Target GitHub Project

Workflow file: `sync-issues-to-project.yml`

Automatically adds issues to a GitHub Project in another organization when they
are opened, and sets their Status to `Done` when they are closed.

---

## How it works

| Event | Action |
|---|---|
| Issue opened | Issue is added to the target project via `addProjectV2ItemById` |
| Issue closed | Project item Status field is updated to `Done` |

The project item is natively linked to the source issue — no custom fields are
needed. Clicking the item in the project board opens the original issue.

---

## Setup

### 1. Create a Personal Access Token (PAT)

The PAT must belong to a user with access to the target org's project.

Required scopes:
- `project` — read/write access to GitHub Projects v2
- `read:org` — required to resolve the org's project by number

> Classic PATs only. Fine-grained PATs do not yet support Projects v2 mutations.

### 2. Add the secret

Go to **Repo → Settings → Secrets and variables → Actions → Secrets**:

| Name | Value |
|---|---|
| `GH_PAT_TOKEN` | The PAT created above |

### 3. Add the variable

Go to **Repo → Settings → Secrets and variables → Actions → Variables**:

| Name | Value | Example |
|---|---|---|
| `GH_TARGET_PROJECT` | `org:project_number` | `kubesmarts:1` |

The project number is visible in the project URL:
`https://github.com/orgs/<org>/projects/<number>`

### 4. Ensure the target project has a Status field

The workflow looks for a **single-select field named exactly `Status`** with the
following options (names are case-sensitive):

| Option | Used when |
|---|---|
| `Backlog` | Issue is opened |
| `Done` | Issue is closed |

If either option is missing or named differently, the corresponding sync step
will fail silently (empty option ID).

---

## Limitations

- **Sub-issues are not synced** — GitHub does not emit webhook events for
  sub-issues; only top-level issues trigger the `issues` event.
- **Status field name is hardcoded** — the field must be named `Status` with
  options named `Backlog` (on open) and `Done` (on close).

---

## Troubleshooting

### `gh: To use GitHub CLI in a GitHub Actions workflow, set the GH_TOKEN environment variable`

The `GH_PAT_TOKEN` secret is not set or is empty. Verify it exists under
**Repo → Settings → Secrets and variables → Actions → Secrets**.

### `Error: Process completed with exit code 1` on the GraphQL steps

Run the query manually to inspect the response:

```bash
gh api graphql -f query='
  query($org: String!, $number: Int!) {
    organization(login: $org) {
      projectV2(number: $number) {
        id
      }
    }
  }' \
  -f org="<target-org>" \
  -F number=<project-number>
```

Common causes:
- The PAT does not have access to the target org's project
- The project number is wrong
- The org name in `GH_TARGET_PROJECT` has a typo

### Item not found on close (`item_id` is empty)

The issue was not previously added to the project. This can happen if:
- The issue was opened before the workflow was installed
- The `opened` sync failed for that issue

To recover, manually add the issue to the project from the project board.

### Status not updated to Done

Verify the target project has:
- A single-select field named exactly `Status`
- An option named exactly `Done`

Field and option names are case-sensitive.
