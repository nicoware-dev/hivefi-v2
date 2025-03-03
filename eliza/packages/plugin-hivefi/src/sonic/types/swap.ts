import { z } from "zod";

export const SwapSchema = z.object({
    params: z.object({
        amount: z.number(),
        fromToken: z.string(),
        toToken: z.string(),
    }),
});

export type SwapContent = z.infer<typeof SwapSchema>;

export function isSwapContent(content: unknown): content is SwapContent {
    try {
        SwapSchema.parse(content);
        return true;
    } catch {
        return false;
    }
}
