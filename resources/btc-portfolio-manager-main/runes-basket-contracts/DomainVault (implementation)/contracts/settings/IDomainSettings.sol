//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDomainSettings {

    //最小投票时长
    function minVoteDuration() external returns (uint256);

    //最大投票时长
    function maxVoteDuration() external returns (uint256);

    //投票百分百
    function votePercentage() external returns (uint256);

    //最小拍卖时长
    function minAuctionDuration() external returns (uint256);

    //最大拍卖时长
    function maxAuctionDuration() external returns (uint256);

    //竞拍加价百分百
    function bidIncreasePercentage() external returns (uint256);

    //最小预售时长
    function minPresaleDuration() external returns (uint256);

    //最大预售时长
    function maxPresaleDuration() external returns (uint256);

}
