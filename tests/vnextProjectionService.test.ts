import { describe, expect, it } from "vitest";
import { asId } from "../src/vnext/domain/ids";
import {
  LeastPrivilegeProjectionService,
  ProjectionRequestError,
  type ProjectionAudience,
  type ProjectionRule,
} from "../src/vnext/projectionService";

interface ProjectionFixtureState {
  hiddenAnswer: string;
  answerRevealed: boolean;
  cardHands: Record<string, string[]>;
  buzzResponses: Record<string, string>;
  teams: Record<string, string[]>;
  siteParticipants: Record<string, string[]>;
  hostPolicy: { canSeeHiddenAnswer: boolean; canSeeBuzzResponses: boolean };
}

function createFixture() {
  let stateVersion = 1;
  const state: ProjectionFixtureState = {
    hiddenAnswer: "SECRET-SOLUTION",
    answerRevealed: false,
    cardHands: {
      "participant-a": ["A-PRIVATE-CARD"],
      "participant-b": ["B-PRIVATE-CARD"],
    },
    buzzResponses: {
      "participant-a": "A-HIDDEN-BUZZ",
      "participant-b": "B-HIDDEN-BUZZ",
    },
    teams: {
      "team-red": ["participant-a"],
      "team-blue": ["participant-b"],
    },
    siteParticipants: {
      "site-1": ["participant-a"],
    },
    hostPolicy: { canSeeHiddenAnswer: false, canSeeBuzzResponses: false },
  };
  const rules: ProjectionRule<ProjectionFixtureState>[] = [
    {
      audienceKind: "PUBLIC_MAIN_STAGE",
      project: (current) => ({
        answer: current.answerRevealed ? current.hiddenAnswer : undefined,
        handCounts: Object.fromEntries(Object.entries(current.cardHands).map(([id, hand]) => [id, hand.length])),
        buzzedParticipants: Object.keys(current.buzzResponses),
      }),
    },
    {
      audienceKind: "PLAYER",
      project: (current, audience) => {
        const participantId = requireAudience(audience, "PLAYER").participantId;
        return {
          hand: current.cardHands[participantId] ?? [],
          ownBuzzResponse: current.buzzResponses[participantId],
        };
      },
    },
    {
      audienceKind: "TEAM",
      project: (current, audience) => {
        const teamId = requireAudience(audience, "TEAM").teamId;
        return {
          participantIds: current.teams[teamId] ?? [],
          handCounts: Object.fromEntries((current.teams[teamId] ?? []).map((id) => [id, current.cardHands[id]?.length ?? 0])),
        };
      },
    },
    {
      audienceKind: "HOST",
      project: (current) => ({
        answer: current.hostPolicy.canSeeHiddenAnswer || current.answerRevealed ? current.hiddenAnswer : undefined,
        buzzResponses: current.hostPolicy.canSeeBuzzResponses ? current.buzzResponses : undefined,
        handCounts: Object.fromEntries(Object.entries(current.cardHands).map(([id, hand]) => [id, hand.length])),
      }),
    },
    {
      audienceKind: "ADMIN",
      project: (current) => ({
        participantCount: Object.keys(current.cardHands).length,
        policy: current.hostPolicy,
      }),
    },
    {
      audienceKind: "LOCAL_SITE",
      project: (current, audience) => {
        const siteId = requireAudience(audience, "LOCAL_SITE").siteId;
        return {
          participantIds: current.siteParticipants[siteId] ?? [],
          participantCount: current.siteParticipants[siteId]?.length ?? 0,
        };
      },
    },
  ];

  return {
    state,
    mutate(mutator: (current: ProjectionFixtureState) => void) {
      mutator(state);
      stateVersion += 1;
    },
    service: new LeastPrivilegeProjectionService({
      sessionId: asId("session-351"),
      getState: () => state,
      getStateVersion: () => stateVersion,
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      rules,
    }),
  };
}

function requireAudience<Kind extends ProjectionAudience["kind"]>(
  audience: ProjectionAudience,
  kind: Kind,
): Extract<ProjectionAudience, { kind: Kind }> {
  if (audience.kind !== kind) throw new Error(`Expected ${kind} audience.`);
  return audience as Extract<ProjectionAudience, { kind: Kind }>;
}

describe("least-privilege ProjectionService (#351)", () => {
  it("prevents public Stage from receiving hidden solutions or private card hands", () => {
    const { service } = createFixture();

    const projection = service.project({ sessionId: asId("session-351"), audience: { kind: "PUBLIC_MAIN_STAGE" } });
    const serialized = JSON.stringify(projection);

    expect(serialized).not.toContain("SECRET-SOLUTION");
    expect(serialized).not.toContain("A-PRIVATE-CARD");
    expect(serialized).not.toContain("B-PRIVATE-CARD");
    expect(projection.payload).toEqual({
      handCounts: { "participant-a": 1, "participant-b": 1 },
      buzzedParticipants: ["participant-a", "participant-b"],
    });
  });

  it("prevents Player A from receiving Player B private hand or answer", () => {
    const { service } = createFixture();

    const projection = service.project({
      sessionId: asId("session-351"),
      audience: { kind: "PLAYER", participantId: asId("participant-a") },
    });
    const serialized = JSON.stringify(projection);

    expect(serialized).toContain("A-PRIVATE-CARD");
    expect(serialized).toContain("A-HIDDEN-BUZZ");
    expect(serialized).not.toContain("B-PRIVATE-CARD");
    expect(serialized).not.toContain("B-HIDDEN-BUZZ");
    expect(serialized).not.toContain("SECRET-SOLUTION");
  });

  it("limits Host hidden state to explicit policy authorization", () => {
    const fixture = createFixture();

    const before = fixture.service.project({ sessionId: asId("session-351"), audience: { kind: "HOST" } });
    expect(JSON.stringify(before)).not.toContain("SECRET-SOLUTION");
    expect(JSON.stringify(before)).not.toContain("A-HIDDEN-BUZZ");

    fixture.mutate((state) => {
      state.hostPolicy.canSeeHiddenAnswer = true;
      state.answerRevealed = true;
    });
    const after = fixture.service.project({ sessionId: asId("session-351"), audience: { kind: "HOST" } });

    expect(JSON.stringify(after)).toContain("SECRET-SOLUTION");
    expect(JSON.stringify(after)).not.toContain("A-HIDDEN-BUZZ");
  });

  it("projects team and local-site audiences without unrelated participant secrets", () => {
    const { service } = createFixture();

    const team = service.project({
      sessionId: asId("session-351"),
      audience: { kind: "TEAM", teamId: asId("team-red") },
    });
    const site = service.project({
      sessionId: asId("session-351"),
      audience: { kind: "LOCAL_SITE", siteId: asId("site-1") },
    });

    expect(team.payload).toEqual({ participantIds: ["participant-a"], handCounts: { "participant-a": 1 } });
    expect(JSON.stringify(team)).not.toContain("participant-b");
    expect(JSON.stringify(team)).not.toContain("SECRET-SOLUTION");
    expect(site.payload).toEqual({ participantIds: ["participant-a"], participantCount: 1 });
    expect(JSON.stringify(site)).not.toContain("B-PRIVATE-CARD");
  });

  it("allows reconnect to request a fresh projection at the current state version", () => {
    const fixture = createFixture();
    fixture.mutate((state) => {
      state.cardHands["participant-a"].push("A-SECOND-CARD");
    });

    const projection = fixture.service.project({
      sessionId: asId("session-351"),
      audience: { kind: "PLAYER", participantId: asId("participant-a") },
      reconnect: true,
      stateVersion: 1,
    });

    expect(projection.stateVersion).toBe(2);
    expect(projection.payload).toEqual({ hand: ["A-PRIVATE-CARD", "A-SECOND-CARD"], ownBuzzResponse: "A-HIDDEN-BUZZ" });
  });

  it("rejects wrong-session and unregistered-audience requests instead of returning full state", () => {
    const { service } = createFixture();

    expect(() => service.project({ sessionId: asId("other-session"), audience: { kind: "PUBLIC_MAIN_STAGE" } })).toThrow(
      ProjectionRequestError,
    );
    const serviceWithoutAdmin = new LeastPrivilegeProjectionService({
      sessionId: asId("session-351"),
      getState: () => ({}),
      getStateVersion: () => 1,
      now: () => new Date("2026-09-29T12:00:00.000Z"),
      rules: [],
    });
    expect(() => serviceWithoutAdmin.project({ sessionId: asId("session-351"), audience: { kind: "ADMIN" } })).toThrow(
      ProjectionRequestError,
    );
  });
});
