# Content Licensing Spec

## Contents

1. Overview
2. Threat Model
3. Pack States
4. Encrypted Pack Format
5. License Keys
6. Key Management
7. Build and Release
8. App Behavior
9. Admin Console
10. Integration With Themed Content
11. Release Distribution
12. Development and Testing
13. Business Prerequisites (Deferred)
14. Steps
15. Acceptance Criteria
16. Open Decisions

---

# 1. Overview

## Summary

Some content packs will be sold separately. All packs still ship in the one app build. Packs chosen for sale are **encrypted at build time** and unlocked with a **signed license key** that the app checks offline.

- One build and one installer for everyone.
- No server, no accounts, no online activation.
- Locked packs are visible as previews so users know what exists.
- Pack updates ship with app updates, and existing licenses keep working.

## Decisions This Spec Records

| Question | Decision | Why |
|---|---|---|
| Ship packs in the app, or a separate installer per pack? | Ship in the app | One build; pack content stays in sync with the app version; no extra installers to code-sign or update |
| Plain unlock code, or encryption + signed license? | Encryption + signed license | The installer's `app.asar` unpacks with one command, so plain content is extractable; signed keys cannot be guessed or generated |
| Online activation? | No | Keeps the app offline; activation needs a server and accounts for little gain with this audience |
| Payment mechanism | Deferred | Licenses are issued manually with a script until a payment service is chosen (section 13) |

## Goals

- People who have not bought a pack cannot read its content by unpacking the installer.
- License keys cannot be forged without the private signing key.
- Everything works offline.
- A buyer's unlock survives app updates and reinstalls (after re-entering the key).
- Adding a new paid pack is a build configuration change, not a code change.

## Non-Goals

- Stopping a buyer from sharing their license key. The app shows "Licensed to *name*" to discourage it.
- Stopping determined reverse engineering of the app itself.
- Payment processing, storefront, or license delivery (deferred).
- Subscription or time-limited licenses.

---

# 2. Threat Model

| Threat | Protected? | How |
|---|---|---|
| Non-buyer unpacks the installer to read a paid pack | Yes | Paid packs are encrypted; keys are only in licenses |
| Non-buyer invents or edits a license key | Yes | Ed25519 signature check with the public key built into the app |
| Non-buyer patches the app to skip the license check | Yes, effectively | Skipping the check does not provide the pack's decryption key |
| Tampered pack file | Yes | AES-GCM authentication fails and the pack stays locked |
| Buyer shares their license key | No | "Licensed to *name*" deters casual sharing; accepted risk |
| Buyer copies decrypted content out of a running app | No | Accepted risk; plaintext is never written to disk, which removes the easy path |
| Private signing key leaks | No | Key management rules (section 6) reduce the risk; recovery requires a new key and app release |

---

# 3. Pack States

```ts
type PackAccess = "free" | "locked" | "unlocked";
```

- **free:** shipped as plain content. Behaves exactly as in `themed-content-spec.md`.
- **locked:** shipped encrypted, no valid license installed. Only the manifest is readable.
- **unlocked:** shipped encrypted, and a valid license covering the pack is installed.

Whether a pack is free or licensed is set only in the private build configuration (section 7.1). Any pack can be licensed: the evergreen packs from the Core split, themed packs, or future expansion packs (`themed-content-spec.md` section 19). Which ones is not yet decided. With no packs listed, everything is free.

---

# 4. Encrypted Pack Format

## 4.1 File

Each licensed pack ships as `<packId>.bcpack` (JSON) next to the free pack folders in the app's data folder. Each game's content file is encrypted separately, so a large pack (for example Scripture Memory, about 1 MB across 6 games) still loads one game at a time:

```ts
interface EncryptedPayload {
  iv: string;                         // base64, 12 bytes, random per file per build
  authTag: string;                    // base64, 16 bytes
  data: string;                       // base64 ciphertext
}

interface EncryptedPackFile {
  format: "bcpack";
  formatVersion: 1;
  manifest: LicensedPackManifest;     // plain, readable while locked
  encryption: {
    algorithm: "AES-256-GCM";
    keyId: string;                    // which pack key encrypted this file (supports rotation)
  };
  games: Record<GameId, EncryptedPayload>;          // one per game content file
  supportingFiles?: Record<string, EncryptedPayload>; // e.g. word-ladder-dictionary.json
}
```

All payloads in a pack use the same pack key, each with its own IV.

## 4.2 Manifest

The manifest is everything the app needs to show a locked preview. It contains no content beyond deliberate samples.

```ts
interface LicensedPackManifest {
  packId: string;
  packName: string;
  description: string;
  categoryId?: ThemedCategoryId;
  accentColor: string;
  packVersion: number;
  games: Array<{
    gameId: GameId;
    sessionCount: number;
    roundCount: number;
  }>;
  predefinedEventIds: string[];       // events that need this pack
  samples: Array<{                    // 1-2 sample rounds per game, chosen by the author
    gameId: GameId;
    round: unknown;                   // valid against the game's round schema
  }>;
  storeUrl?: string;                  // "Get this pack" link; omitted until payments exist
}
```

- Sample rounds are also present in the encrypted payload. They are copied, not removed.
- The manifest is validated at build time: samples must validate against their game schema, and counts must match the payload.

## 4.3 Payload

Each decrypted payload is an ordinary game content file, exactly as it appears in a built-in pack folder (`themed-content-spec.md` section 19.4). The manifest carries the same fields as `BuiltInPackManifest` plus the preview fields above. Once decrypted, content goes through the same validation and loading as any other pack.

---

# 5. License Keys

## 5.1 Payload

```ts
interface LicensePayload {
  v: 1;
  licenseId: string;                  // unique, e.g. "L-2027-0001"
  licensee: string;                   // name shown as "Licensed to ..."
  issuedAt: string;                   // ISO date
  packs: Array<{
    packId: string;
    keyId: string;
    key: string;                      // base64, 32-byte AES key for this pack
  }>;
  note?: string;                      // e.g. "Complimentary", "Church bundle"
}
```

- The license carries the pack keys. This is why patching out the signature check does not unlock anything: without a license, the app has no keys.
- No email address or other personal data beyond the display name. Nothing in a license is ever sent anywhere.

## 5.2 Signature and Encoding

- Signature algorithm: **Ed25519** (Node `crypto.sign` / `crypto.verify`, no extra dependency).
- Signed bytes: the UTF-8 JSON of the payload with keys in a fixed order (canonical JSON).
- License string: `BCL1.<base64url(payload)>.<base64url(signature)>`
- Delivered as a pasteable string or as a `.bclicense` file containing that string.

## 5.3 Verification

In the Electron main process:

1. Parse the prefix, payload, and signature. Reject malformed input with a clear message.
2. Verify the signature with the public key(s) built into the app (section 6.3).
3. Reject if `licenseId` is on the shipped denylist (section 6.5).
4. Accept the license. For each pack in it, try to decrypt the matching `.bcpack`:
   - Wrong `keyId` for the shipped file: that pack stays locked, and the app reports "This license is for an older version of this pack's key."
   - Decryption or authentication failure: that pack stays locked, and the error is logged.
5. Store the license (section 8.4).

## 5.4 Scope Rules

- A license unlocks the listed pack IDs for **all future versions** of those packs, as long as the pack key has not been rotated.
- Several licenses can be installed at once. Unlocks combine.
- A license that covers a pack not present in the current app version is kept and applies when that pack ships.

---

# 6. Key Management

## 6.1 Keys

| Key | Purpose | Where it lives |
|---|---|---|
| License signing private key (Ed25519) | Signs licenses | Offline vault only |
| License signing public key | Verifies licenses | Built into the app |
| Pack key, one per licensed pack (AES-256) | Encrypts the pack at build time; delivered inside licenses | Offline vault only |

## 6.2 Vault Rules

- **No private key or pack key is ever committed to any repo**, including the private source repo.
- The vault is an encrypted file or password-manager entry outside the repo, with at least one offline backup.
- Build scripts read keys from a vault path given in an environment variable (`BIBLE_CHALLENGE_KEY_VAULT`). The release build fails if it is missing.
- **Losing the signing key** means no new licenses can be issued until a new key ships in an app update.
- **Leaking the signing key** means anyone can create licenses; recovery requires rotation (6.4).

## 6.3 Public Keys in the App

```ts
const LICENSE_PUBLIC_KEYS: Record<string, string> = {
  "sig-2027-1": "<base64 Ed25519 public key>"
};
```

- Licenses record which signing key made them (add `sigKeyId` to the license prefix or payload once a second key exists).
- Multiple public keys allow rotation without invalidating existing licenses.

## 6.4 Rotation

- **Signing key:** add a new public key to the app, start signing with the new private key. Remove the old public key only if it leaked; then reissue licenses signed with the new key.
- **Pack key:** only if a pack key leaks. Generate a new key and `keyId`, re-encrypt the pack, and reissue licenses for that pack. Old licenses keep unlocking older app versions only.

## 6.5 Denylist

- The app ships a small list of revoked `licenseId`s (for example, a key posted publicly).
- Revocation takes effect only when users update the app. This is a limitation of offline licensing and is accepted.

---

# 7. Build and Release

## 7.1 Private Build Configuration

`licensing.config.json` in the private source repo (not in the app bundle):

```json
{
  "licensedPacks": [],
  "samplesPerGame": 1
}
```

Packs not listed build as free packs. The list starts empty; filling it in is the deferred free-versus-licensed decision.

## 7.2 Build Steps

1. Validate every pack (schemas, tags, content solvability) as today.
2. For each licensed pack: build the manifest, pick samples, encrypt each game content file and supporting file with the pack key (a random IV per file), and write `<packId>.bcpack`.
3. Remove the plaintext licensed pack files from the build output.
4. Package the app.

Script: `release-scripts/encrypt-packs.mjs`, run by the release build after `vite build` and before packaging.

## 7.3 Release Guard

A release check runs after packaging and **fails the release** if:

- Any licensed pack's plaintext file is present in `dist/` or `app.asar`.
- A distinctive string from each licensed pack's non-sample content (recorded at encrypt time) is found anywhere in `app.asar`.
- Any `.bcpack` fails to decrypt with its own pack key (proves the shipped file is usable).
- The vault was not available.

## 7.4 Tools

In the private repo, under `scripts/licensing/`:

| Script | Purpose |
|---|---|
| `generate-signing-key.mjs` | Creates an Ed25519 key pair; writes the private key to the vault and prints the public key |
| `generate-pack-key.mjs --pack <id>` | Creates a pack key and `keyId` in the vault |
| `issue-license.mjs --licensee "<name>" --packs a,b [--note ...]` | Creates a signed license string and `.bclicense` file |
| `inspect-license.mjs <license>` | Prints and verifies a license without revealing pack keys |

Until payments exist, licenses are issued by hand with `issue-license.mjs` (for example, for family, testers, or churches).

---

# 8. App Behavior

## 8.1 Where Decryption Happens

- Only the Electron main process handles licenses and pack keys.
- Main decrypts unlocked packs at startup and after a license is added, keeps the plaintext **in memory only**, and serves it to the renderer through the existing content IPC.
- The renderer never receives pack keys or license payloads, only the list of licenses (ID, licensee, pack names, issue date) for display.
- Decrypted content is never written to disk, cached, or logged.

## 8.2 Locked Pack Preview

When a themed category's pack is locked:

- The category tab is shown (not hidden) with a lock indicator.
- Selecting it shows a preview page: pack name, description, accent color, list of games with round counts, and the sample rounds.
- Sample rounds can be played as a short demo (one round per game).
- An **Unlock** button opens the license entry dialog.
- A **Get this pack** link appears only when the manifest has `storeUrl`.

## 8.3 Licenses Screen

New section in Settings (Content tab):

- **Enter license:** paste a license string or import a `.bclicense` file (via file dialog).
- Clear results: "Unlocked: Christmas, Easter / Resurrection Day" or a specific error (malformed, invalid signature, revoked, pack key mismatch).
- **Installed licenses** list: licensee, license ID, issue date, packs covered, and pack status (unlocked, not in this version, key mismatch).
- **Remove license:** locks its packs again after confirmation.

## 8.4 Storage

- Licenses are stored as `userData/licenses/<licenseId>.bclicense`.
- The folder is in the shared userData, so the admin console sees the same licenses.
- Reinstalling the app keeps userData, so licenses survive. A new PC needs the license entered again.
- Invalid or unreadable license files are ignored and reported on the Licenses screen, never deleted automatically.

## 8.5 "Licensed To"

- About screen lists each installed license: "Christmas, Easter: Licensed to *name*."
- Each unlocked pack's category header shows "Licensed to *name*" in small text.

---

# 9. Admin Console

- Shares the licenses folder through userData and uses the same verification and decryption code (shared module).
- **Library:** locked packs show as locked with the manifest only. Unlocked packs can be previewed in full.
- **No duplicate or export for licensed packs**, locked or unlocked. Exporting an unlocked pack as plain JSON would make sharing trivial.
- To extend a licensed pack, the admin creates a new custom pack with the same `categoryId`. Its content merges into the category alongside the licensed pack.
- A **Licenses** view matching the app's Licenses screen.

---

# 10. Integration With Themed Content

Changes to `themed-content-spec.md` behavior:

| Area | Behavior with licensing |
|---|---|
| Loading (6.3) | The single loading path asks main for pack content; locked packs return only their manifest |
| Hidden empty categories (3.1) | A category whose only pack is locked is **shown** with a lock, not hidden |
| Games without content (19.3) | A game whose only content is in locked packs appears only inside those packs' previews |
| Existing installs (19.7) | Receive a hand-issued license; no automatic legacy unlock |
| Visibility (4) | Unchanged; unlocked content follows the same exclusive-category rules |
| Predefined events (7) | Events needing a locked pack show as unavailable with reason "Pack not unlocked" and an Unlock button |
| Featured seasonal event (8) | For a locked in-season pack, the card shows as a preview with Unlock instead of Start |
| Daily Challenge (9) | Locked packs are never used in the daily pool |
| Admin duplicate/export (12) | Disabled for licensed packs (section 9) |
| `All Installed Challenges` (4.2) | Includes unlocked and free themed content only |

---

# 11. Release Distribution

The source repo is private. The admin console's update checker (`admin/electron/main.js:359-373`) falls back to a GitHub token for private releases, which works only for the developer.

Before any build goes to people other than the developer:

- Create a public **releases-only** repo (for example `bible-challenge-releases`) containing installers and release notes, no source.
- Point `GITHUB_OWNER` / `GITHUB_REPO` in the update checker at it.
- The release build publishes installers there.

This is required regardless of licensing, but licensing is the point where outside users are expected.

---

# 12. Development and Testing

## 12.1 Development

- In unpackaged development runs, `BIBLE_CHALLENGE_DEV_UNLOCK_ALL=1` loads licensed packs from their plaintext source, skipping encryption. Ignored when `app.isPackaged` is true.
- Without that flag, development builds behave like production: licensed packs must be built encrypted and unlocked with a license.

## 12.2 Test Keys

- A test signing key pair and test pack keys live in `tests/fixtures/licensing/`. They are test-only and never used for real licenses.
- In test mode (`automated-testing-spec.md` 4.1: E2E flag and not packaged), the app accepts the test public key in addition to the real ones.
- A fixture licensed pack is encrypted with a test pack key during test setup.

## 12.3 Unit Tests

- License parsing: valid, malformed prefix, bad base64, missing fields.
- Signature: valid; payload changed by one byte; wrong public key; revoked ID.
- Decryption: correct key; wrong key; ciphertext or auth tag changed; wrong `keyId`.
- Canonical JSON produces identical bytes regardless of key order.
- Manifest validation: sample rounds valid, counts match payload.

## 12.4 End-to-End Tests

- Locked category shows preview, sample rounds play, full games are unavailable.
- Enter a test license: pack unlocks, games play, "Licensed to" appears.
- Relaunch: pack stays unlocked.
- Remove license: pack locks again.
- Invalid and revoked licenses show the right errors.
- Featured seasonal event and predefined events show locked variants, then normal after unlocking.
- Admin: locked pack preview limited to manifest; duplicate and export unavailable for licensed packs.
- Cross-app: license added in the challenge app is recognized by the admin console.

## 12.5 Release Guard Test

The release guard (7.3) runs against a test build with a fixture licensed pack and fails when plaintext is deliberately left in.

---

# 13. Business Prerequisites (Deferred)

Not needed to build the licensing system. Needed before selling:

- **Payment service:** a merchant of record (for example Lemon Squeezy or Paddle) that handles sales tax, receipts, and refunds. Later, a sale can trigger `issue-license.mjs` automatically.
- **Rights review:** confirm all pack content is original or public domain, including study notes. The KJV is public domain in the US but under Crown letters patent in the UK.
- **Terms of sale and license terms,** including what "updates included" means.
- **Store page** and `storeUrl` in manifests.
- **Free versus paid line-up** (Open Decisions).

---

# 14. Steps

### Step 1: Formats and Tools

- `.bcpack` format, manifest, license format, canonical JSON.
- Vault setup; key generation, license issuing, and inspection scripts.

### Step 2: Build and Release Guard

- `encrypt-packs.mjs` and `licensing.config.json`.
- Release guard checks.

### Step 3: Main-Process Licensing

- Verification, denylist, decryption, in-memory content, license storage.
- Content IPC returns manifests for locked packs.

### Step 4: App UI

- Locked category preview with sample play.
- Licenses screen, "Licensed to" display.
- Locked variants of predefined and featured events.

### Step 5: Admin Console

- Shared licensing module, locked/unlocked library behavior, Licenses view, duplicate/export restrictions.

### Step 6: Releases Repo

- Public releases-only repo and update checker change (section 11).

### Step 7 (Deferred): Payments

- Payment service, store page, automatic license issuing.

---

# 15. Acceptance Criteria

- A packaged build contains no plaintext for any licensed pack; the release guard proves it.
- Locked packs show a preview with sample rounds and cannot be played beyond the samples.
- A valid license unlocks exactly the packs it lists, offline, and survives app restarts and updates.
- A license changed in any way, or signed with another key, is rejected.
- A revoked license is rejected after the app update that ships the denylist entry.
- Pack keys and decrypted content never reach the renderer's storage, disk, or logs.
- Licensed packs cannot be duplicated or exported from the admin console.
- Releasing a new version of a licensed pack does not require reissuing licenses.
- The app works exactly as before when no packs are licensed.

---

# 16. Open Decisions

1. **Free versus paid packs.** Which of the packs from the Core split (`themed-content-spec.md` 19.5), themed packs, and future expansions are licensed. Deferred.
2. **Bundles.** Sell individual packs only, or also bundles (for example "All seasonal packs")? A bundle is just a license listing several packs, but packs added later would need a new license.
3. **Updates policy.** Are future versions of a pack included forever (current design), or only for a period?
4. **Sample size.** One sample round per game, or more?
5. **Church or group licensing.** One license per household, or a church license with the church name as licensee?
