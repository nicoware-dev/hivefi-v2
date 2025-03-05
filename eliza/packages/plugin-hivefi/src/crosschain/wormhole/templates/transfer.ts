/**
 * Template for token transfer via Wormhole
 */
export const transferTemplate = `
I've initiated a cross-chain transfer of {{amount}} {{token}} from {{sourceChain}} to {{destinationChain}} via the Wormhole bridge.

Transaction hash: {{transactionHash}}

Your transfer is now being processed. This cross-chain transfer typically takes a few minutes to complete, depending on network conditions. Once the transfer is complete, you'll need to redeem your tokens on the destination chain.

To redeem your tokens, you can simply ask me to "redeem my tokens from Wormhole" or "claim my {{token}} on {{destinationChain}}".

Note:
- Gas fees apply on both chains for cross-chain transfers
- Keep your transaction hash for reference if needed
- Small test amounts are recommended for first-time transfers
`;

/**
 * Template for token redemption via Wormhole
 */
export const redeemTemplate = `
I've successfully redeemed your {{token}} tokens on {{chain}} from the Wormhole cross-chain transfer.

Transaction hash: {{transactionHash}}

Your tokens should now be available in your wallet on the {{chain}} network. The redemption process is complete.

Note:
- Gas fees apply for redemption transactions
- If you don't see your tokens immediately, please allow a few minutes for the transaction to be confirmed
- You can check the transaction status using the transaction hash provided above
`; 