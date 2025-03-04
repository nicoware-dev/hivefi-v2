//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDomainVault {

    function afterTokenTransferForDomainFraction(address from, address to, uint256 amount) external;
}
