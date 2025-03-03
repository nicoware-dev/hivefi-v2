import type { Action, ActionExample } from "@elizaos/core";

/**
 * Create a generic action with default values
 * @param name Action name
 * @param description Action description
 * @param handler Action handler function
 * @returns Action object
 */
export function createGenericAction(
  name: string,
  description: string,
  handler: Action["handler"],
  similes: string[] = [],
  examples: ActionExample[] = []
): Action {
  return {
    name,
    description,
    similes,
    examples,
    validate: async () => true,
    handler,
  };
} 