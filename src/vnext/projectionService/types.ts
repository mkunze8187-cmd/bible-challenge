import type { ParticipantId, SessionId, SiteId, TeamId } from "../domain/ids";

export type ProjectionAudience =
  | { kind: "PUBLIC_MAIN_STAGE" }
  | { kind: "HOST" }
  | { kind: "PLAYER"; participantId: ParticipantId }
  | { kind: "TEAM"; teamId: TeamId }
  | { kind: "ADMIN" }
  | { kind: "LOCAL_SITE"; siteId: SiteId };

export interface ProjectionRequest {
  sessionId: SessionId;
  audience: ProjectionAudience;
  stateVersion?: number;
  reconnect?: boolean;
}

export interface ProjectionEnvelope<Payload = unknown> {
  contractVersion: "projection.v1";
  sessionId: SessionId;
  audience: ProjectionAudience;
  stateVersion: number;
  generatedAt: string;
  payload: Payload;
}

export interface ProjectionRule<AuthoritativeState> {
  audienceKind: ProjectionAudience["kind"];
  project(state: AuthoritativeState, audience: ProjectionAudience): unknown;
}

export interface ProjectionService<AuthoritativeState = unknown> {
  project(request: ProjectionRequest): ProjectionEnvelope;
}

export class ProjectionRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectionRequestError";
  }
}
