const hre = require("hardhat");

const {ethers,upgrades} = require("hardhat");
// const fs = require('fs');

async function main() {
  const Num1 = await hre.ethers.getContractFactory("Num1")
  const num1 = await upgrades.deployProxy(Num1, [12],{
    initializer:"update"
  });
  await num1.waitForDeployment();
  console.log("num1 deployed to:", await num1.getAddress())

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


