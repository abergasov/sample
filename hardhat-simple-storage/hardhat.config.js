require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("./tasks/block_number")
require("hardhat-gas-reporter")
require("solidity-coverage")

task("accounts", "Deploy the contract", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log("Account:", account.address);
  }
})

module.exports = {}

const goerliRPC = process.env.GOERLI_RPC_URL
const privateKey = process.env.PRIVATE_KEY
const ethScanKey = process.env.ETHSCAN_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    goerli: {
      url: goerliRPC,
      accounts: [privateKey],
      chainId: 5
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337
    }
  },
  solidity: "0.8.17",
  etherscan: {
    apiKey: ethScanKey
  },
  gasReporter: {
    currency: "USD",
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_KEY,
    token: "ETH",
  }
};

