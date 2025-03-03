import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

const MANTLE_PUBLIC_RPC = "https://rpc.mantle.xyz";

export const mantleEnvSchema = z.object({
    MANTLE_ADDRESS: z.string().min(1, "Mantle address is required"),
    MANTLE_PRIVATE_KEY: z.string().min(1, "Mantle private key is required"),
    MANTLE_RPC_URL: z.string().min(1, "Mantle RPC URL is required"),
});

export type MantleConfig = z.infer<typeof mantleEnvSchema>;

export async function validateMantleConfig(
    runtime: IAgentRuntime
): Promise<MantleConfig> {
    try {
        const config = {
            MANTLE_ADDRESS:
                runtime.getSetting("MANTLE_ADDRESS") ||
                process.env.MANTLE_ADDRESS,
            MANTLE_PRIVATE_KEY:
                runtime.getSetting("MANTLE_PRIVATE_KEY") ||
                process.env.MANTLE_PRIVATE_KEY,
            MANTLE_RPC_URL:
                runtime.getSetting("MANTLE_RPC_URL") ||
                process.env.MANTLE_RPC_URL ||
                MANTLE_PUBLIC_RPC,
        };

        return mantleEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `Mantle configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
