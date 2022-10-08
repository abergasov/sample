const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId

	let ethUsdPriceFeed
	if (developmentChains.includes(network.name)) {
		const mockAggregator = await deployments.get("MockV3Aggregator")
		ethUsdPriceFeed = mockAggregator.address
	} else {
		ethUsdPriceFeed = networkConfig[chainId]["ethUsdPriceFeed"]
	}

	log("Deploying with oracle address:", ethUsdPriceFeed)

	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: [ethUsdPriceFeed], // network price feed address
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})
	log("FundMe deployed to:", fundMe.address)
	log("------------------------------------")

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(fundMe.address, [ethUsdPriceFeed])
	}
}

module.exports.tags = ["all"]