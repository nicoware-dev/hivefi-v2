export const transferPatterns = [
  /transfer(?:ring)?\s+(?:\d*\.?\d+)\s+(?:native\s+)?tokens?\s+(?:from\s+\w+(?:\s+\w+)?\s+to\s+\w+(?:\s+\w+)?)/i,
  /send(?:ing)?\s+(?:\d*\.?\d+)\s+(?:native\s+)?tokens?\s+(?:from\s+\w+(?:\s+\w+)?\s+to\s+\w+(?:\s+\w+)?)/i,
  /move(?:ing)?\s+(?:\d*\.?\d+)\s+(?:native\s+)?tokens?\s+(?:from\s+\w+(?:\s+\w+)?\s+to\s+\w+(?:\s+\w+)?)/i,
  /bridge(?:ing)?\s+(?:\d*\.?\d+)\s+(?:native\s+)?tokens?\s+(?:from\s+\w+(?:\s+\w+)?\s+to\s+\w+(?:\s+\w+)?)/i
];

export const redeemPatterns = [
  /redeem(?:ing)?\s+(?:native\s+)?tokens?/i,
  /claim(?:ing)?\s+(?:native\s+)?tokens?/i
];

export function isTransferRequest(text: string): boolean {
  return transferPatterns.some(pattern => pattern.test(text));
}

export function isRedeemRequest(text: string): boolean {
  return redeemPatterns.some(pattern => pattern.test(text));
} 