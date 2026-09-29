import Ajv2020 from "ajv/dist/2020.js";

export const sessionCommandEnvelopeJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  additionalProperties: false,
  required: [
    "contractVersion",
    "protocolVersion",
    "commandId",
    "sessionId",
    "actor",
    "correlationId",
    "idempotencyKey",
    "commandType",
    "payload",
  ],
  properties: {
    contractVersion: { const: "session-runtime-command.v1" },
    protocolVersion: { const: "1.0" },
    commandId: { type: "string", minLength: 1 },
    sessionId: { type: "string", minLength: 1 },
    actor: {
      type: "object",
      additionalProperties: false,
      required: ["role", "actorId"],
      properties: {
        role: { enum: ["player", "team", "host", "admin", "system"] },
        actorId: { type: "string", minLength: 1 },
        participantId: { type: "string", minLength: 1 },
        teamId: { type: "string", minLength: 1 },
        siteId: { type: "string", minLength: 1 },
      },
    },
    endpointId: { type: "string", minLength: 1 },
    siteId: { type: "string", minLength: 1 },
    correlationId: { type: "string", minLength: 1 },
    idempotencyKey: { type: "string", minLength: 1 },
    commandType: { type: "string", minLength: 1 },
    payload: {},
    expectedStateVersion: { type: "integer", minimum: 0 },
    clientObservedAt: { type: "string", minLength: 1 },
  },
} as const;

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateCommand = ajv.compile(sessionCommandEnvelopeJsonSchema);

export interface SessionSchemaValidationResult {
  valid: boolean;
  errors: { path: string; message: string }[];
}

export function validateSessionCommandEnvelopeShape(candidate: unknown): SessionSchemaValidationResult {
  const valid = validateCommand(candidate);
  if (valid) return { valid: true, errors: [] };

  return {
    valid: false,
    errors: (validateCommand.errors ?? []).map((error) => ({
      path: error.instancePath || "/",
      message: error.message ?? "invalid value",
    })),
  };
}
