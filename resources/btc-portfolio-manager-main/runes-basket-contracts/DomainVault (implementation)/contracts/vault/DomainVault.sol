//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

import {IERC721PermitUpgradeable} from "../erc721/IERC721PermitUpgradeable.sol";
import {IDomainVault} from "../vault/IDomainVault.sol";
import {IDomainFraction} from "../erc20/IDomainFraction.sol";
import {IDomainSettings} from "../settings/IDomainSettings.sol";
import {IWETH} from "../interfaces/IWETH.sol";

contract DomainVault is IDomainVault, ERC721Holder, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {

    using SafeMath for uint256;

    address public WETH;

    address public domainSettings;

    // erc20 fraction
    address public fraction;

    // erc721 collection
    address public collection;

    // erc721 tokenId
    uint256 public tokenId;

    // currency
    address public priceCurrency;

    // 保底价
    uint256 public reservePrice;

    // 投票时长（秒）
    uint256 public voteDuration;

    // 投票通过比率
    uint256 public votePercentage;

    // 竞标时长（秒）
    uint256 public auctionDuration;

    // 通过票数(阈值)
    uint256 public passVotes;

    // ballot box
    uint256 public ballotBox;

    // 票数 ballotBox(uint256) => votes(uint256)
    mapping(uint256 => uint256) public votesMapping;

    // 投票结束时间（秒） ballotBox(uint256) => voteEndTime(uint256)
    mapping(uint256 => uint256) public voteEndTimeMapping;

    mapping(uint256 => uint256) public remainVoteEndTimeMapping;

    // 竞标结束时间（秒） ballotBox(uint256) => auctionEndTime(uint256)
    mapping(uint256 => uint256) public auctionEndTimeMapping;

    mapping(uint256 => uint256) public remainAuctionEndTimeMapping;

    // 当前竞标价 ballotBox(uint256) => bidPrice(uint256)
    mapping(uint256 => uint256) public bidPriceMapping;

    // 当前竞标者 ballotBox(uint256) => bidder(uint256)
    mapping(uint256 => address) public bidderMapping;

    // 投票是否通过 ballotBox(uint256) => votePassed(bool)
    mapping(uint256 => bool) public votePassedMapping;

    // 投票人 ballotBox(uint256) => voter(address) => whether voted(bool)
    mapping(uint256 => mapping(address => bool)) private _whetherVotedMapping;

    event Redeem(address indexed owner);
    event FirstBid(address indexed bidder, uint256 bidPrice);
    event Vote(address indexed voter, uint256 votes);
    event Bid(address indexed bidder, uint256 bidPrice);
    event ClaimNFT(address indexed bidder, uint256 tokenId);
    event ClaimFunds(address indexed erc20Owner, uint256 withdrawERC20Amount, uint256 fundsShareAmount);
    event WithdrawBidFunds(address indexed bidder, uint256 bidPrice);
    event AddVoter(address indexed voter);
    event RemoveVoter(address indexed voter);

    /**
    *  @notice Buy presale fraction using ETH
     * @param fraction_ fraction
     * @param collection_ collection
     * @param tokenId_ tokenId
     * @param domainSettings_ domainSettings
     * @param priceCurrency_ priceCurrency
     * @param reservePrice_ reservePrice
     * @param voteDuration_ voteDuration
     * @param votePercentage_ votePercentage
     * @param auctionDuration_ auctionDuration
     * @param WETH_ WETH
     * @param owner owner
     */
    function initialize(address fraction_,
        address collection_,
        uint256 tokenId_,
        address domainSettings_,
        address priceCurrency_,
        uint256 reservePrice_,
        uint256 voteDuration_,
        uint256 votePercentage_,
        uint256 auctionDuration_,
        address WETH_,
        address owner
    ) public initializer {
        //
        __Ownable_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        //
        _transferOwnership(owner);
        //
        fraction = fraction_;
        collection = collection_;
        tokenId = tokenId_;
        domainSettings = domainSettings_;
        priceCurrency = priceCurrency_;
        //
        require(reservePrice_ >= 1000, "DomainVault: reserve price must be >= 1000");
        reservePrice = reservePrice_;
        //
        require(voteDuration_ >= IDomainSettings(domainSettings).minVoteDuration(), "DomainVault: vote duration too low");
        require(voteDuration_ <= IDomainSettings(domainSettings).maxVoteDuration(), "DomainVault: vote duration too high");
        voteDuration = voteDuration_;
        //
        require(votePercentage_ >= 5100, "DomainVault: vote percentage too low");
        require(votePercentage_ <= 10000, "DomainVault: vote percentage too high");
        votePercentage = votePercentage_;
        //
        require(auctionDuration_ >= IDomainSettings(domainSettings).minAuctionDuration(), "DomainVault: auction duration too low");
        require(auctionDuration_ <= IDomainSettings(domainSettings).maxAuctionDuration(), "DomainVault: auction duration too high");
        auctionDuration = auctionDuration_;
        //
        WETH = WETH_;
        //
        ballotBox = 0;
        votesMapping[ballotBox] = 0;
        voteEndTimeMapping[ballotBox] = 0;
        auctionEndTimeMapping[ballotBox] = 0;
        bidPriceMapping[ballotBox] = 0;
        bidderMapping[ballotBox] = address(0);
        votePassedMapping[ballotBox] = false;
    }

    receive() external payable {}

    function pause() external onlyOwner {
        if(votePassedMapping[ballotBox]){
            if(auctionEndTimeMapping[ballotBox] > _currentTime()){
                remainAuctionEndTimeMapping[ballotBox] = _currentTime() - auctionEndTimeMapping[ballotBox];
                auctionEndTimeMapping[ballotBox] = _currentTime() + 315360000;
            }
        }else{
            if(voteEndTimeMapping[ballotBox] > _currentTime()){
                remainVoteEndTimeMapping[ballotBox] = _currentTime() - voteEndTimeMapping[ballotBox];
                voteEndTimeMapping[ballotBox] = _currentTime() + 315360000;
            }
        }
        _pause();
    }

    function unpause() external onlyOwner {
        if(votePassedMapping[ballotBox]){
            if(auctionEndTimeMapping[ballotBox] > _currentTime()){
                auctionEndTimeMapping[ballotBox] = _currentTime() + remainAuctionEndTimeMapping[ballotBox];
                remainAuctionEndTimeMapping[ballotBox] = 0;
            }
        }else{
            if(voteEndTimeMapping[ballotBox] > _currentTime()){
                voteEndTimeMapping[ballotBox] = _currentTime() + remainVoteEndTimeMapping[ballotBox];
                remainVoteEndTimeMapping[ballotBox] = 0;
            }
        }
        _unpause();
    }

    function afterTokenTransferForDomainFraction(address from, address to, uint256 amount) external {
        //
        require(_msgSender() == fraction, "DomainVault: caller must domain erc20");
        //投票已结束，不允许撤票
        if (voteEndTimeMapping[ballotBox] > _currentTime()) {
            //判断投票人 from
            if (from != address(0) && _whetherVotedMapping[ballotBox][from]) {
                //销毁或转给抵押库 不减票
                if (to != address(0) && to != address(this)) {
                    //减少票数
                    votesMapping[ballotBox] -= amount;
                    //设置投票是否通过
                    _setVotePassed();
                    //
                    _afterVote();
                    //
                    emit Vote(_msgSender(), votesMapping[ballotBox]);
                }
                //判断用户票数
                uint256 fractionBalance = IERC20Metadata(fraction).balanceOf(from);
                if (fractionBalance == 0) {
                    //
                    _whetherVotedMapping[ballotBox][from] = false;
                    //event
                    emit RemoveVoter(from);
                }
            }
            //判断投票人 to
            if (to != address(0) && _whetherVotedMapping[ballotBox][to]) {
                //添加票数
                votesMapping[ballotBox] += amount;
                //设置投票是否通过
                _setVotePassed();
                //
                _afterVote();
                //event
                emit Vote(_msgSender(), votesMapping[ballotBox]);
            }
        }
    }

    //赎回
    function redeemWithPermit(uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        // erc20 totalSupply
        uint256 fractionTotalSupply = IERC20Metadata(fraction).totalSupply();
        // permit
        IDomainFraction(fraction).permit(_msgSender(), address(this), fractionTotalSupply, deadline, v, r, s);
        // redeem
        redeem();
    }

    //赎回
    function redeem() public whenNotPaused nonReentrant {
        //竞标未开始
        require(auctionEndTimeMapping[ballotBox] == 0, "DomainVault: auctioning or auctioned, can't redeeming");
        //投票未通过
        require(!votePassedMapping[ballotBox], "DomainVault: voted passed, can't redeeming");
        //投票未开始 或 结束
        require(voteEndTimeMapping[ballotBox] < _currentTime(), "DomainVault: voting, can't redeeming");
        //退回原竞标者资金
        if (bidPriceMapping[ballotBox] > 0 && bidderMapping[ballotBox] != address(0)) {
            //IERC20Metadata(priceCurrency).transfer(bidder, bidPriceMapping[ballotBox]);
            if (priceCurrency == WETH) {
                IWETH(WETH).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
            } else {
                IERC20Metadata(priceCurrency).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
            }
        }
        //erc20全部
        uint256 fractionTotalSupply = IERC20Metadata(fraction).totalSupply();
        //将调用者的碎片转入当前
        IERC20Metadata(fraction).transferFrom(_msgSender(), address(this), fractionTotalSupply);
        //销毁碎片
        IDomainFraction(fraction).burnForDomainVault(fractionTotalSupply);
        //转移NFT
        IERC721(collection).safeTransferFrom(address(this), _msgSender(), tokenId);
        //event
        emit Redeem(_msgSender());
    }

    /**
     * 首次出价
     */
    function firstBidUsingETHAndWETH(uint256 currentBidPrice) external payable whenNotPaused nonReentrant {
        //
        _beforeFirstBid(currentBidPrice);
        //退回原竞标者资金
        if (bidPriceMapping[ballotBox] > 0 && bidderMapping[ballotBox] != address(0)) {
            IWETH(WETH).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
        }
        //收款
        if (currentBidPrice > msg.value) {
            IWETH(WETH).transferFrom(_msgSender(), address(this), (currentBidPrice - msg.value));
        } else {
            require(currentBidPrice == msg.value, "DomainVault: msg.value too high");
        }
        IWETH(WETH).deposit{value : msg.value}();
        //
        _afterFirstBid(currentBidPrice);
    }

    /**
     * 首次出价
     */
    function firstBid(uint256 currentBidPrice) external payable whenNotPaused nonReentrant {
        //
        _beforeFirstBid(currentBidPrice);
        //退回原竞标者资金
        if (bidPriceMapping[ballotBox] > 0 && bidderMapping[ballotBox] != address(0)) {
            IERC20Metadata(priceCurrency).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
        }
        //收款
        IERC20Metadata(priceCurrency).transferFrom(_msgSender(), address(this), currentBidPrice);
        //
        _afterFirstBid(currentBidPrice);

    }

    function _beforeFirstBid(uint256 currentBidPrice) private {
        //竞标未开始
        require(auctionEndTimeMapping[ballotBox] == 0, "DomainVault: auctioning, can't make offer bid");
        //投票未开始 或 投票已结束 且未通过
        require(voteEndTimeMapping[ballotBox] == 0 || (voteEndTimeMapping[ballotBox] < _currentTime() && !votePassedMapping[ballotBox]), "DomainVault: voting or voted passed, can't make offer bid");
        //最小竞标出价比例
        uint256 bidIncreasePercentage = _getBidIncreasePercentage();
        //比保底价（非上次竞拍价）至少高出1%
        require(uint256(currentBidPrice).mul(10000) >= uint256(reservePrice).mul(bidIncreasePercentage), "DomainVault: bid price lower than reserve price");
    }

    function _afterFirstBid(uint256 currentBidPrice) private {
        //新票箱
        ballotBox = _currentTime();
        //新的竞标价
        bidPriceMapping[ballotBox] = currentBidPrice;
        //新的竞标者
        bidderMapping[ballotBox] = _msgSender();
        //设置投票结束时间(投票开始计时)
        voteEndTimeMapping[ballotBox] = voteDuration.add(_currentTime());
        //竞标结束时间
        auctionEndTimeMapping[ballotBox] = 0;
        //票数
        votesMapping[ballotBox] = 0;
        //投票不通过
        votePassedMapping[ballotBox] = false;
        //
        uint256 originalTotalSupply_ = IDomainFraction(fraction).originalTotalSupply();
        passVotes = originalTotalSupply_ * votePercentage;
        //event
        emit FirstBid(_msgSender(), bidPriceMapping[ballotBox]);
    }

    //投票
    function vote() external whenNotPaused nonReentrant {
        //投票未通过，投票未结束
        require(!votePassedMapping[ballotBox] && voteEndTimeMapping[ballotBox] > _currentTime(), "DomainVault: vote passed or closed");
        //竞标未开始
        require(auctionEndTimeMapping[ballotBox] == 0, "DomainVault: auctioning, can't vote");
        //用户票数
        uint256 fractionBalance = IERC20Metadata(fraction).balanceOf(_msgSender());
        //票数大于0
        require(fractionBalance > 0, "DomainVault: fraction balance insufficient");
        //是否重复投票
        require(!_whetherVotedMapping[ballotBox][_msgSender()], "DomainVault: you has voted");
        //添加投票人
        _whetherVotedMapping[ballotBox][_msgSender()] = true;
        emit AddVoter(_msgSender());
        //添加票数
        votesMapping[ballotBox] += fractionBalance;
        //设置投票是否通过
        _setVotePassed();
        //
        _afterVote();
        //event
        emit Vote(_msgSender(), fractionBalance);
    }

    function _afterVote() private {
        //投票时间是否延长15分钟
        if (!votePassedMapping[ballotBox] && voteEndTimeMapping[ballotBox].sub(_currentTime()) <= 15 minutes) {
            voteEndTimeMapping[ballotBox] += 15 minutes;
        }
        //如果投票通过，设置竞标结束时间(竞拍开始计时)
        if (votePassedMapping[ballotBox] && auctionEndTimeMapping[ballotBox] == 0) {
            auctionEndTimeMapping[ballotBox] = auctionDuration.add(_currentTime());
        }
    }

    //出价
    function bid(uint256 currentBidPrice) external whenNotPaused nonReentrant {
        //
        _beforeBid(currentBidPrice);
        //退回上一个竞标者资金
        if (bidPriceMapping[ballotBox] > 0 && bidderMapping[ballotBox] != address(0)) {
            IERC20Metadata(priceCurrency).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
        }
        //收款
        IERC20Metadata(priceCurrency).transferFrom(_msgSender(), address(this), currentBidPrice);
        //
        _afterBid(currentBidPrice);
    }

    //出价
    function bidUsingETHAndWETH(uint256 currentBidPrice) external payable whenNotPaused nonReentrant {
        //
        _beforeBid(currentBidPrice);
        //退回上一个竞标者资金
        if (bidPriceMapping[ballotBox] > 0 && bidderMapping[ballotBox] != address(0)) {
            IWETH(WETH).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
        }
        //收款
        if (currentBidPrice > msg.value) {
            IWETH(WETH).transferFrom(_msgSender(), address(this), (currentBidPrice - msg.value));
        } else {
            require(currentBidPrice == msg.value, "DomainVault: msg.value too high");
        }
        IWETH(WETH).deposit{value : msg.value}();
        //
        _afterBid(currentBidPrice);
    }

    function _beforeBid(uint256 currentBidPrice) private {
        //是否已经出价
        require(bidderMapping[ballotBox] != _msgSender(), "DomainVault: you already bid");
        //投票通过
        require(votePassedMapping[ballotBox], "DomainVault: vote not passed");
        //竞标未结束
        require(auctionEndTimeMapping[ballotBox] > _currentTime(), "DomainVault: auction close, can't bid");
        //最小竞标出价比例
        uint256 bidIncreasePercentage = _getBidIncreasePercentage();
        //比上次竞拍价（非保底价）至少高出1%
        require(uint256(currentBidPrice).mul(uint256(10000)) >= uint256(bidPriceMapping[ballotBox]).mul(bidIncreasePercentage), "DomainVault: bid price lower than reserve price");
    }

    function _afterBid(uint256 currentBidPrice) private {
        //新的竞标价
        bidPriceMapping[ballotBox] = currentBidPrice;
        //新的竞标者
        bidderMapping[ballotBox] = _msgSender();
        //竞标时间是否延长15分钟
        if (auctionEndTimeMapping[ballotBox].sub(_currentTime()) <= 15 minutes) {
            auctionEndTimeMapping[ballotBox] += 15 minutes;
        }
        //event
        emit Bid(_msgSender(), bidPriceMapping[ballotBox]);
    }

    //撤回竞标资金（投票不通过）
    function withdrawBidFunds() external payable whenNotPaused nonReentrant {
        //投票已结束,且投票不通过
        require(voteEndTimeMapping[ballotBox] > 0 && voteEndTimeMapping[ballotBox] < _currentTime() && !votePassedMapping[ballotBox], "DomainVault: voting or voted passed, you can't withdraw bid funds");
        //未开始竞标
        require(auctionEndTimeMapping[ballotBox] == 0, "DomainVault: auctioning, you can't withdraw bid funds");
        //必须是竞标人
        require(_msgSender() == bidderMapping[ballotBox], "DomainVault: you can't withdraw bid funds");
        //当前资金大于0
        require(bidPriceMapping[ballotBox] > 0, "DomainVault: you got bid funds back");
        //撤回资金
        IERC20Metadata(priceCurrency).transfer(bidderMapping[ballotBox], bidPriceMapping[ballotBox]);
        //event
        emit WithdrawBidFunds(_msgSender(), bidPriceMapping[ballotBox]);
        //竞标价至0
        bidPriceMapping[ballotBox] = 0;
        //竞标人至0
        bidderMapping[ballotBox] = address(0);
    }

    //领取NFT
    function claimNFT() external whenNotPaused nonReentrant {
        //NFT在当前抵押库中
        require(IERC721(collection).ownerOf(tokenId) == address(this), "DomainVault: NFT nonexistent, already claim");
        //投票通过
        require(votePassedMapping[ballotBox], "DomainVault: vote no passed, can't claim NFT");
        //竞标结束
        require(auctionEndTimeMapping[ballotBox] < _currentTime(), "DomainVault: auctioning, can't claim NFT");
        //必须是竞标人
        require(_msgSender() == bidderMapping[ballotBox], "DomainVault: you can't claim NFT");
        //转移NFT
        IERC721(collection).safeTransferFrom(address(this), _msgSender(), tokenId);
        //event
        emit ClaimNFT(_msgSender(), tokenId);
    }

    //碎片持有人取资金
    function claimFundsWithPermit(uint256 burnFractionAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        //签名授权
        IDomainFraction(fraction).permit(_msgSender(), address(this), burnFractionAmount, deadline, v, r, s);
        //
        claimFunds(burnFractionAmount);
    }

    //碎片持有人取资金
    function claimFunds(uint256 burnFractionAmount) public whenNotPaused nonReentrant {
        //投票通过
        require(votePassedMapping[ballotBox], "DomainVault: vote no passed, can't claim funds");
        //竞标结束
        require(auctionEndTimeMapping[ballotBox] < _currentTime(), "DomainVault: auctioning, can't claim funds");
        //领取额度大于0，小于等于调用者的碎片余额
        uint256 callerFractionBalance = IERC20Metadata(fraction).balanceOf(_msgSender());
        require(callerFractionBalance > 0 && burnFractionAmount <= callerFractionBalance, "DomainVault: fraction balance insufficient");
        //当前抵押库资金大于0
        uint256 vaultFundsBalance = IERC20Metadata(priceCurrency).balanceOf(address(this));
        require(vaultFundsBalance > 0, "DomainVault: your funds is zero");
        //调用者领取资金份额
        uint256 originalTotalSupply_ = IDomainFraction(fraction).originalTotalSupply();
        uint256 fundsShareAmount = (burnFractionAmount.mul(vaultFundsBalance)).div(originalTotalSupply_);
        //调用者取回资金必须小于等于抵押库存量资金
        require(fundsShareAmount <= vaultFundsBalance, "DomainVault: funds insufficient");
        //调用者碎片转入当前抵押库
        IERC20Metadata(fraction).transferFrom(_msgSender(), address(this), burnFractionAmount);
        //销毁碎片
        IDomainFraction(fraction).burnForDomainVault(burnFractionAmount);
        //资金转账给调用者
        IERC20Metadata(priceCurrency).transfer(_msgSender(), fundsShareAmount);
        //event
        emit ClaimFunds(_msgSender(), burnFractionAmount, fundsShareAmount);
    }

    //最小竞标出价比例
    function _getBidIncreasePercentage() private returns (uint256) {
        uint256 bidIncreasePercentage = IDomainSettings(domainSettings).bidIncreasePercentage();
        return uint256(10000).add(bidIncreasePercentage);
    }

    //设置投票是否通过
    function _setVotePassed() private {
        votePassedMapping[ballotBox] = (votesMapping[ballotBox].mul(uint256(10000)) >= passVotes);
    }

    function _currentTime() private view returns (uint256) {
        return block.timestamp;
    }

}
