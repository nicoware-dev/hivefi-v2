// fc-1c97436691454d6c802bd82c2507e55c

import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

export const firecrawlEnvSchema = z.object({
    FIRECRAWL_API_KEY: z.string().min(1, "Firecrawl API key is required"),
});

export type firecrawlConfig = z.infer<typeof firecrawlEnvSchema>;

export async function validateFirecrawlConfig(
    runtime: IAgentRuntime
): Promise<firecrawlConfig> {
    try {
        const config = {
            FIRECRAWL_API_KEY: runtime.getSetting("FIRECRAWL_API_KEY"),
        };
        console.log("config: ", config);
        return firecrawlEnvSchema.parse(config);
    } catch (error) {
        console.log("error::::", error);
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Firecrawl API configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
