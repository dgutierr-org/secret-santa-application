# Sync Issues to Target GitHub Project

Workflow file: `sync-issues-to-project.yml`

Automatically adds issues to a GitHub Project in another organization when they
are opened, sets configurable initial field values, and updates the Status when
they are closed.

---

## How it works

| Event | Action |
|---|---|
| Issue opened | Issue is added to the target project; initial field values are applied |
| Issue closed | Project item Status is updated to the configured close status |

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

### 3. Add the variables

Go to **Repo → Settings → Secrets and variables → Actions → Variables**:

| Name | Required | Default | Description |
|---|---|---|---|
| `GH_TARGET_PROJECT` | yes | — | Target project in `org:project_number` format |
| `GH_ISSUE_INITIAL_VALUES` | no | — | Comma-separated `field=value` pairs applied when an issue is opened; step is skipped if not set |
| `GH_ISSUE_CLOSE_STATUS` | no | `Done` | Status option name applied when an issue is closed |

The project number is visible in the project URL:
`https://github.com/orgs/<org>/projects/<number>`

#### `GH_ISSUE_INITIAL_VALUES` format

Comma-separated `field=value` pairs. Field names must match the project field
names exactly (case-sensitive). Example:

```
Status=Backlog, Area=Tooling, Assignees=lornakelly
```

Supported field types:

| Field type | Behaviour |
|---|---|
| Single-select | Matches by option name |
| Text | Sets the text value directly |
| `Assignees` | Adds assignees to the source issue via the REST API; space-separate multiple users: `Assignees=user1 user2` |

> Number and date fields are not currently supported.

### 4. Ensure the target project has a Status field

The workflow looks for a **single-select field named exactly `Status`**. The
option names used by `GH_ISSUE_INITIAL_VALUES` and `GH_ISSUE_CLOSE_STATUS` must
exist in the project (case-sensitive).

Default options required unless overridden:

| Option | Used when |
|---|---|
| `Done` | Issue closed (default close Status) |

---

## Limitations

- **Sub-issues are not synced** — GitHub does not emit webhook events for
  sub-issues; only top-level issues trigger the `issues` event.
- **Status field name is hardcoded** — the field must be named `Status`.
- **Number and date fields** in `GH_ISSUE_INITIAL_VALUES` are not supported;
  only single-select and text fields.

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

### Status not updated on close

Verify the target project has:
- A single-select field named exactly `Status`
- An option matching the value of `GH_ISSUE_CLOSE_STATUS` (default: `Done`)

Field and option names are case-sensitive.

### Field not found warning in `Set initial field values`

The step prints `Warning: field '<name>' not found, skipping.` when a key in
`GH_ISSUE_INITIAL_VALUES` does not match any field in the project. Check for
typos or extra spaces in the variable value.
