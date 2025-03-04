const hre = require("hardhat");
// const fs = require('fs');

async function main() {
  const cfxprice = await hre.ethers.getContractFactory("CFXPrice")
  const pythContractAddress = "0xDd24F84d36BF92C65F92307595335bdFab5Bbd21";
  const price = await cfxprice.deploy(pythContractAddress);
  await price.deployed();
  console.log("HelloWorld deployed to:", price.address);

  // fs.writeFileSync('./config.js', `export const marketplaceAddress = "${nftMarketplace.address}"`)
}

main()
  .then(() => process.exit(0))  
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


