
require ('@nomiclabs/hardhat-waffle');


module.exports = {
  solidity: "0.8.10",

  defaultNetwork: "confluxTestnet",
  networks:{
    hardhat:{},
    confluxTestnet: {
      url: "https://evmtestnet.confluxrpc.com	" || "",
      chainId:71 ,
      accounts: ['5753e65f56865a161fbf41932a0d855139a4ce9dc20d82fb655bff393fc41702']
    },
  }
};