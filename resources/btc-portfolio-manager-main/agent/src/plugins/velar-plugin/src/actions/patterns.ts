const swapPatterns = [
  /swap\s+(?:(\d*\.?\d+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i,
  /exchange\s+(?:(\d*\.?\d+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i,
  /trade\s+(?:(\d*\.?\d+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i,
  /convert\s+(?:(\d*\.?\d+)\s+)?(\w+)\s+(?:for|to)\s+(\w+)/i
];

// Valid tokens from Velar API response
const validTokens = new Set([
  'STX', 'LEO', 'LONG', 'SOME', 'PEPE', 'ROCK', 'MICK', 'stSTX', '$ROO', 'aBTC',
  'aeUSDC', 'VELAR', 'WELSH', 'ODIN', 'sWELSH', 'sODIN', 'sROO', 'Hat', 'POMBOO',
  'NOT', 'GOATSTX', 'ALUX', 'MWM', 'ETHEREUM', 'NOCC', 'KNFE', 'Pogo', 'TREMP',
  'GOLF', 'DFV', 'Blitz', 'sCHA', 'SPIT', 'iQC', 'wCHA', 'VIKI', 'iCC', 'sbtc',
  'iMM', 'EDMUND', 'HSHKO', 'FUJI', 'IRON', 'GME', 'FAM', 'CLOK10', 'FAIR', 'TEN',
  'VENCE', 'iPP', 'EDLC', 'STONE', 'FTC', 'SKULL', 'Walter', 'Moist', 'MOON', 'MST',
  'THCAM', 'USDh', 'BOOSTER', 'BLEWY', 'FlatEarth', 'GYAT', 'HOAX', 'BAO', 'TRUTH',
  'DGAF', 'WEN', 'FRESH', 'Clive', 'RMFAM', 'KANGA', 'KWON', 'MATEO', 'TYCHU', 'LESS',
  'PNUT', 'SIM', 'WPS', 'TURTO', 'SAYLOR', 'Godl', 'Beans', 'ROSSTX', 'MEME', 'ROONS',
  'kinq', 'WALLY', 'PPPP', 'SNTA', 'sAI', 'MANA', 'DIKO', 'XRP', 'ADA', 'DOGE',
  'AIdog', 'KINU', 'FLIP', 'UAP', 'Rocket', 'WOJAK', 'NASTY', 'stxAI', 'sBTC',
  'Smoke', 'BONE', 'NERDY', 'GRINCH', 'NORM', 'BOB', 'KEKIUS', 'NINJA', 'SONIC',
  'NINJAS', 'MSTR', 'StxCHAD', 'CHUNK', 'ZEST', 'AIBTC', 'TRUMP', 'RADIO', 'MELENIA',
  'BTS', 'DEGENS', 'AIDAO', 'BTZ'
]);

export interface SwapMatch {
  amount?: number;
  inToken: string;
  outToken: string;
}

export function isSwapRequest(text: string): boolean {
  return extractSwapDetails(text) !== null;
}

export function extractSwapDetails(text: string): SwapMatch | null {
  for (const pattern of swapPatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    
    const [, amount, inToken, outToken] = match;
    
    // Validate tokens
    if (!validTokens.has(inToken.toUpperCase()) || !validTokens.has(outToken.toUpperCase())) {
      continue;
    }
    
    return {
      amount: amount ? parseFloat(amount) : undefined,
      inToken: inToken.toUpperCase(),
      outToken: outToken.toUpperCase()
    };
  }
  
  return null;
} 