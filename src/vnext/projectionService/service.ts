import type { SessionId } from "../domain/ids";
import { ProjectionRequestError, type ProjectionEnvelope, type ProjectionRequest, type ProjectionRule, type ProjectionService } from "./types";

export interface LeastPrivilegeProjectionServiceOptions<AuthoritativeState> {
  sessionId: SessionId;
  getState: () => AuthoritativeState;
  getStateVersion: () => number;
  now: () => Date;
  rules: ProjectionRule<AuthoritativeState>[];
}

export class LeastPrivilegeProjectionService<AuthoritativeState> implements ProjectionService<AuthoritativeState> {
  constructor(private readonly options: LeastPrivilegeProjectionServiceOptions<AuthoritativeState>) {}

  project(request: ProjectionRequest): ProjectionEnvelope {
    if (request.sessionId !== this.options.sessionId) {
      throw new ProjectionRequestError(`Projection requested for wrong session "${request.sessionId}".`);
    }

    const rule = this.options.rules.find((candidate) => candidate.audienceKind === request.audience.kind);
    if (!rule) {
      throw new ProjectionRequestError(`No projection rule registered for audience "${request.audience.kind}".`);
    }

    const payload = rule.project(this.options.getState(), request.audience);
    return {
      contractVersion: "projection.v1",
      sessionId: this.options.sessionId,
      audience: request.audience,
      stateVersion: this.options.getStateVersion(),
      generatedAt: this.options.now().toISOString(),
      payload: JSON.parse(JSON.stringify(payload)),
    };
  }
}
