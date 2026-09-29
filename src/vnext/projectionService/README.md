# ProjectionService

Least-privilege projection contracts for #351. Design source: [`specs/architecture/multi-runtime-platform.md`](../../../specs/architecture/multi-runtime-platform.md), ProjectionService section.

`LeastPrivilegeProjectionService` turns authoritative state into audience-specific `ProjectionEnvelope` payloads for `PUBLIC_MAIN_STAGE`, `HOST`, `PLAYER`, `TEAM`, `ADMIN` and future `LOCAL_SITE` audiences. Projection rules explicitly construct allowed payloads; authoritative state is never blindly serialized.

Reconnect uses the same `project` request path and returns a fresh projection at the current state version.
