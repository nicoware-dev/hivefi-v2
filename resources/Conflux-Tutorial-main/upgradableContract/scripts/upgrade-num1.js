const hre = require("hardhat");

const {ethers,upgrades} = require("hardhat");
// const fs = require('fs');

async function main() {
  const Num2 = await hre.ethers.getContractFactory("Num2")
  const num1 = await upgrades.upgradeProxy('0xb2873916D01A48D0E7A588F6E2aA411f2B66d5b0',Num2);
console.log("Num1 updated sucesfully!")

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


