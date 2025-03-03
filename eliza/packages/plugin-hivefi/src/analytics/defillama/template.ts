import { 
  getMultiversXTVL, 
  getProtocolByName, 
  getTopMultiversXProtocols 
} from './module';

export const getMultiversXTVLTemplate = `
Get the total value locked (TVL) for the MultiversX ecosystem.
`;

export const getProtocolByNameTemplate = `
Get detailed information about a specific DeFi protocol on MultiversX.

Required parameters:
- name: The name of the protocol (e.g., "xExchange", "Hatom")
`;

export const getTopMultiversXProtocolsTemplate = `
Get information about the top protocols on MultiversX by TVL.

Optional parameters:
- limit: The number of protocols to return (default: 10)
`; 