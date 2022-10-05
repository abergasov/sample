// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers, run, network } = require("hardhat");

async function main() {
  const simpleStorageFabric = await ethers.getContractFactory("SimpleStorage");
  console.log("Start deploying...")
  const simpleStorage = await simpleStorageFabric.deploy();
  await simpleStorage.deployed();
  console.log(`Deployed contract to: ${simpleStorage.address}`);
  if (network.config.chainId === 5 && process.env.ETHSCAN_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, [])
  }
  currentValue = await simpleStorage.retrieve();
  console.log(`Current value: ${currentValue.toString()}`);
  console.log("Start setting value...")
  const txResp = await simpleStorage.store(42);
  await txResp.wait(1);

  updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value: ${updatedValue.toString()}`);
}

async function verify(contractAddress, args) {
  console.log("Start verifying...")
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Contract already verified");
    } else {
      console.error(error)
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
