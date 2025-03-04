// SPDX-License-Identifier: MIT
pragma solidity =0.8.9;

interface IFactory {
    function alva() external view returns (address);

    function minPercentALVA() external view returns (uint);
}
