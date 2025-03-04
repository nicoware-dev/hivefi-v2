const strategyPatterns = [
  /use\s+(?:the\s+)?(\w+)\s+strategy/i,
  /invest\s+(?:using|with)\s+(?:the\s+)?(\w+)\s+strategy/i,
  /deposit\s+(?:into|using)\s+(?:the\s+)?(\w+)\s+strategy/i,
  /switch\s+to\s+(?:the\s+)?(\w+)\s+strategy/i
];

const validStrategies = [
  'segment',
  'solv',
  'avalon',
  'bedrock',
  'pell',
  'ionic'
];

export function isStrategyRequest(text: string): boolean {
  // Check if any pattern matches
  const matches = strategyPatterns.some(pattern => {
    const match = text.match(pattern);
    if (!match) return false;
    
    // Extract strategy name from match
    const strategyName = match[1]?.toLowerCase();
    if (!strategyName) return false;
    
    // Check if it's a valid strategy
    return validStrategies.includes(strategyName);
  });
  
  return matches;
}

export function extractStrategyName(text: string): string | null {
  for (const pattern of strategyPatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    
    const strategyName = match[1]?.toLowerCase();
    if (!strategyName || !validStrategies.includes(strategyName)) continue;
    
    return strategyName;
  }
  
  return null;
} 