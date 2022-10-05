import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-waffle";
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "@nomiclabs/hardhat-ethers"
import "./tasks/block_number"
import "@typechain/hardhat" // позволяет использовать типы из SC в ts

const goerliRPC = process.env.GOERLI_RPC_URL || "123"
const privateKey = process.env.PRIVATE_KEY || ""
const ethScanKey = process.env.ETHSCAN_KEY

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
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

export default config;