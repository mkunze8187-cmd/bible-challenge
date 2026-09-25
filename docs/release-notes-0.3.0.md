# Bible Challenge 0.3.0

## Host Remote

- Adds Host Remote so the host can run game controls from a phone or tablet while the laptop drives the projector.
- Adds local LAN pairing with an 8-digit code, QR code, laptop approval, one active remote at a time, reconnect support, and revoke.
- Adds a touch-first remote controller with answerer selection, correct/incorrect judging, reveal, skip, next, undo, timer controls, answer key, notes, and scoreboard controls.
- Adds LAN server hardening for Host and Origin checks, role-scoped messages, route allow-listing, CSP, no-store responses, payload limits, rate limits, and heartbeat cleanup.

## Host Setup Notes

- Windows may show a firewall prompt the first time Host Remote is enabled. Allow access on Private networks.
- Use a Private network profile when possible. Public network profiles may block device-to-device traffic.
- If guest Wi-Fi blocks the phone or tablet from reaching the laptop, use Windows Mobile Hotspot from the laptop and connect the remote device to that hotspot.
- Host Remote uses plain HTTP on the local network. Anyone who can capture local network traffic could read host-only content such as the answer key.
- Keep the pairing code hidden until ready to pair, especially when laptop displays are mirrored.

## Release Validation

- Root typecheck: `npm run typecheck`
- Root unit tests: `npm run test:run`
- Root build/data validation: `npm run build`
- Admin typecheck: `npm run typecheck:admin`
