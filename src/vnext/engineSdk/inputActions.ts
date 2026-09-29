import type { ActorContext } from "./types";
import { UnauthorizedEngineCommandError } from "./types";

export interface InputActionDescriptor {
  actionId: string;
  capability: string;
  commandType: string;
  allowedRoles: ActorContext["role"][];
  payloadSchema?: unknown;
}

export interface SemanticEngineCommand<Payload = unknown> {
  type: string;
  payload: Payload;
}

export class DuplicateInputActionError extends Error {
  constructor(public readonly actionId: string) {
    super(`InputAction "${actionId}" is already registered.`);
    this.name = "DuplicateInputActionError";
  }
}

export class UnknownInputActionError extends Error {
  constructor(public readonly actionId: string) {
    super(`InputAction "${actionId}" is not registered.`);
    this.name = "UnknownInputActionError";
  }
}

export class InputActionRegistry {
  private readonly actions = new Map<string, InputActionDescriptor>();

  registerAction(action: InputActionDescriptor): void {
    if (this.actions.has(action.actionId)) {
      throw new DuplicateInputActionError(action.actionId);
    }

    this.actions.set(action.actionId, action);
  }

  getAction(actionId: string): InputActionDescriptor | undefined {
    return this.actions.get(actionId);
  }

  listActionsForCapability(capability: string): InputActionDescriptor[] {
    return [...this.actions.values()].filter((action) => action.capability === capability);
  }

  createCommand<Payload>(
    actionId: string,
    actor: ActorContext,
    payload: Payload,
  ): SemanticEngineCommand<Payload> {
    const action = this.actions.get(actionId);
    if (!action) throw new UnknownInputActionError(actionId);

    if (!action.allowedRoles.includes(actor.role)) {
      throw new UnauthorizedEngineCommandError(
        `Actor role "${actor.role}" is not authorized for InputAction "${actionId}".`,
      );
    }

    return { type: action.commandType, payload };
  }
}
