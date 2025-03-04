const validTokens = [
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
];

export const swapTemplate = `You are an AI assistant specialized in processing token swap requests on Velar. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Here's a list of supported tokens:
<supported_tokens>
${validTokens.join('\n')}
</supported_tokens>

Your goal is to extract the following information about the requested swap:
1. Input token (must be one of the supported tokens)
2. Output token (must be one of the supported tokens)
3. Amount to swap (optional, but must be a positive number if provided)
4. Slippage tolerance (optional, defaults to 0.5%)

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part of the message mentioning the input token
   - Quote the part mentioning the output token
   - Quote the part mentioning the amount (if any)
   - Quote the part mentioning slippage (if any)

2. Validate each piece of information:
   - Input Token: Check if the mentioned token is in the list of supported tokens
   - Output Token: Check if the mentioned token is in the list of supported tokens
   - Amount: If provided, attempt to convert to a number and verify it's positive
   - Slippage: If provided, verify it's a reasonable percentage (0.1% to 50%)

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. The JSON should have this structure:

\`\`\`json
{
    "inToken": string,
    "outToken": string,
    "amount": number | undefined,
    "slippage": number | undefined
}
\`\`\`

Remember:
- Both token names must exactly match one of the supported tokens
- Amount should be a positive number if provided
- Slippage should be a reasonable percentage (0.1% to 50%) if provided
- If amount or slippage is not specified, they should be undefined in the output

Now, process the user's request and provide your response.
`; 