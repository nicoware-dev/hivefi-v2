/**
 * Crosschain Module
 * 
 * This module provides cross-chain functionality for the HiveFi plugin.
 * It includes submodules for different cross-chain protocols.
 */

// Import and re-export Wormhole module
import { 
  wormholeActions, 
  wormholeProviders 
} from './wormhole';

// Export Wormhole types and utilities
export * from './wormhole/types/index';
export * from './wormhole/utils/index';
export * from './wormhole/api/index';
export * from './wormhole/templates/index';
export * from './wormhole/config/index';

// Export Wormhole module with namespace
export * as wormhole from './wormhole';

/**
 * Export all crosschain actions
 * Currently includes only Wormhole actions
 */
export const crosschainActions = [
  ...wormholeActions
];

/**
 * Export all crosschain providers
 * Currently includes only Wormhole providers
 */
export const crosschainProviders = [
  ...wormholeProviders
];

// Default export of all crosschain actions
export default crosschainActions;
