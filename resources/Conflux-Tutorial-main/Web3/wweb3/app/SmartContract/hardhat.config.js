
require ('@nomiclabs/hardhat-waffle');
require('@openzeppelin/hardhat-upgrades');
require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
module.exports = {
  solidity: "0.8.10",

  defaultNetwork: "confluxTestnet",
  networks:{
    hardhat:{},
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com	" || "",
      chainId:71 ,
      accounts: ['prvtekey']
    },
  }
};