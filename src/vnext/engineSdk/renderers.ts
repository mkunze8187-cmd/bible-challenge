export type RendererSurface = "stage" | "controller" | "host";

export interface RendererContribution {
  contributionId: string;
  capability: string;
  surface: RendererSurface;
  projectionType: string;
  rendererId: string;
  version: string;
}

export class DuplicateRendererContributionError extends Error {
  constructor(public readonly contributionId: string) {
    super(`Renderer contribution "${contributionId}" is already registered.`);
    this.name = "DuplicateRendererContributionError";
  }
}

export class RendererContributionRegistry {
  private readonly contributions = new Map<string, RendererContribution>();

  registerContribution(contribution: RendererContribution): void {
    if (this.contributions.has(contribution.contributionId)) {
      throw new DuplicateRendererContributionError(contribution.contributionId);
    }

    this.contributions.set(contribution.contributionId, contribution);
  }

  findContribution(criteria: {
    capability: string;
    surface: RendererSurface;
    contributionId?: string;
  }): RendererContribution | undefined {
    return [...this.contributions.values()].find(
      (contribution) =>
        contribution.capability === criteria.capability &&
        contribution.surface === criteria.surface &&
        (!criteria.contributionId || contribution.contributionId === criteria.contributionId),
    );
  }
}
