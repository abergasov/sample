const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
	if (developmentChains.includes(network.name)) {
		const { deploy, log } = deployments
		const { deployer } = await getNamedAccounts()

		const DECIMALS = 8
		const INITIAL_ANSWER = 200000000000

		log("Deploying Mocks for local network")
		await deploy("MockV3Aggregator", {
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_ANSWER], // требует чисто этот мок
		})
		log("Mocks deployed")
		log("------------------------------------")
	}
}

module.exports.tags = ["all", "mocks"]