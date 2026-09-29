# Timer

Authoritative Agon Timer foundation for #156. Design source: [`specs/agon-timer-system-spec.md`](../../../specs/agon-timer-system-spec.md).

`TimerService` owns timer state and lifecycle. Clients derive display from `TimerProjection`; reconnect, backgrounding, orientation changes and reflow do not mutate or reset authoritative time. Commands use state-version and idempotency conventions so duplicate control messages do not accidentally start, pause or expire a timer twice.
