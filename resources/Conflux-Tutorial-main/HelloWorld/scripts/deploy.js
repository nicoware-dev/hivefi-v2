const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const Helooworld = await hre.ethers.getContractFactory("HelloWorld")
  const hellooworld = await Helooworld.deploy();
  await hellooworld.deployed();
  console.log("HelloWorld deployed to:", hellooworld.address);

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


