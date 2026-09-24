# AI Context & Execution Rules

## 🤐 Verbosity & Tone Control
* **Code-First Output:** Deliver the target code or diff immediately. Do not introduce the code or summarize what you are about to do.
* **No Post-Mortem Explanations:** Do not write paragraphs explaining why the fix works unless explicitly asked ("explain why").
* **Zero Conversational Fluff:** Omit all pleasantries ("Sure, I can help!"), apologies, or structural sign-offs.
* **Compact Markdown:** No full-file rewrites. Output only the specific lines or functions changed. Use concise comments inline if a line requires context.

## 🏛 Project Architecture (Monorepo)
* **Root App:** Windows Electron app (Main/Preload in `electron/`, Renderer in `src/`).
* **Admin Workspace:** Admin Console SPA (`admin/` workspace, named `bible-challenge-admin`).
* **Shared Data/Schemas:** `src/data/` (Schemas are vendored to `admin/src/data/schemas/` via sync script).

## ⚠️ Workspace & Context Guardrails
* **Workspace Isolation:** Confirm if a file belongs to the Root Electron App or the Admin Console before editing to avoid mixed imports.
* **Schema Sync Warning:** If modifying JSON schemas in `src/data/`, append the schema sync command to the end of the output.
* **Never Guess Paths:** If file structure is ambiguous, ask to list the directory or view package.json first.

## 🏃‍♂️ Critical Commands (Run from Root via PowerShell)
* **Dev/Run Challenge App:** `npm run start` (Builds then launches Electron)
* **Dev/Run Admin App:** `npm run start --workspace bible-challenge-admin`
* **Typecheck:** `npm run typecheck` | `npm run typecheck:admin`
* **Test Suite:**
  * Root Unit: `npm run test:run`
  * Admin Unit: `npm run test:admin`
  * E2E Smoke: `npm run test:e2e` (or `npm run test:e2e:fast` if dist is fresh)
  * Complete Validation: `npm run test:all`
* **Data & Schemas:**
  * Validate: `npm run check:data`
  * Sync Admin Copies: `npm run sync-schemas --workspace bible-challenge-admin -- --source ..`

## 📁 Key File Map
* Electron Main/Preload: `electron/`
* UI Components (Root): `src/`
* UI Components (Admin): `admin/src/`
* Visual Test Snapshots & E2E: `tests/`
