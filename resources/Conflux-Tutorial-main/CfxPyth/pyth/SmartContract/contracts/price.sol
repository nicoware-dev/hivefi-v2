// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";


contract CFXPrice {
    IPyth pyth;
    bytes32 constant CFX_USD_PRICE_ID = 0x8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933;

    constructor(address pythContract) {
        pyth = IPyth(pythContract);
    }

    function getCFXPrice(bytes[] calldata priceUpdateData) public payable returns (int64, uint) {
        uint fee = pyth.getUpdateFee(priceUpdateData);
        pyth.updatePriceFeeds{value: fee}(priceUpdateData);

        PythStructs.Price memory price = pyth.getPriceNoOlderThan(CFX_USD_PRICE_ID,60);
        return (price.price, price.conf);
    }
}