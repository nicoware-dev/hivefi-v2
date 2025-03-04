//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20WithPermiteUpgradeable} from './IERC20WithPermiteUpgradeable.sol';

interface IDomainFraction is IERC20WithPermiteUpgradeable {

    function domainVault() external view returns (address);

    function originalTotalSupply() external view returns (uint256);

    function burnForDomainVault(uint256 amount) external;

}
