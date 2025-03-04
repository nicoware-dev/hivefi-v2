const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const GreeTing = await hre.ethers.getContractFactory("Greeting")
  const greeting = await GreeTing.deploy();
  await greeting.waitForDeployment();
  console.log("Greeting contract deployed to:", await greeting.getAddress());

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });