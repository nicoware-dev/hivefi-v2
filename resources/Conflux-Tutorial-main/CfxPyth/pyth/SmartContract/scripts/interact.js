const hre = require("hardhat");
const { EvmPriceServiceConnection } = require("@pythnetwork/pyth-evm-js");

async function main() {
  const CFXPrice = await hre.ethers.getContractFactory("CFXPrice");
  const cfxPrice = await CFXPrice.attach("0x1354fef885CD6917E67F911E6a43321963E28d27");

  const connection = new EvmPriceServiceConnection(
    "https://hermes.pyth.network"
  );

  const priceIds = [
    "0x8879170230c9603342f3837cf9a8e76c61791198fb1271bb2552c9af7b33c933",
  ];

  try {
    const priceUpdateData = await connection.getPriceFeedsUpdateData(priceIds);
    
    const updateFee = hre.ethers.utils.parseEther("0.01");

    // Estimate gas
    const gasEstimate = await cfxPrice.estimateGas.getCFXPrice(priceUpdateData, {
      value: updateFee,
    });

    console.log("Estimated gas:", gasEstimate.toString());

    // Call getCFXPrice function
    const tx = await cfxPrice.getCFXPrice(priceUpdateData, {
      value: updateFee,
    });

    console.log("Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Get the price directly using callStatic instead of staticCall
    const [price, confidence] = await cfxPrice.callStatic.getCFXPrice(priceUpdateData, {
      value: updateFee,
    });

    console.log("CFX/USD Price:", hre.ethers.utils.formatUnits(price, 8));
    console.log("Confidence:", hre.ethers.utils.formatUnits(confidence, 8));

  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});