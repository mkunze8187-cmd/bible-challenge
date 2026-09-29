# SessionRuntime Contracts

Versioned SessionRuntime command/event contracts for #350. Design source: [`specs/architecture/multi-runtime-platform.md`](../../../specs/architecture/multi-runtime-platform.md), SessionRuntime and command/event model sections.

`SessionCommandEnvelope` is the transport-neutral mutation boundary. Commands carry protocol version, session ID, actor/role/site context, correlation ID, idempotency key, optional client-known state version and typed semantic payload.

`InMemorySessionRuntime` is a contract fixture, not the final game runtime. It validates command shape, session, actor role, phase, state version and semantic command boundaries, then emits authoritative versioned events. Local, Shared and Hosted transports can serialize the same envelopes without runtime-specific fields.
