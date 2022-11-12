const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts, deployments }) {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const BASE_FEE = ethers.utils.parseEther("0.25")// premium cost, it cost 0.25 link per request
	const GAS_PRICE_LINK = 1e9 // 1 gwei


	if (developmentChains.includes(network.name)) {
		log("Deploying Mocks")

		await deploy("VRFCoordinatorV2Mock", {
			from: deployer,
			args: [BASE_FEE, GAS_PRICE_LINK],
			log: true,
			waitConfirmations: network.config.waitConfirmations || 1,
		});
		log("Deployed VRFCoordinatorV2Mock")
		log("------------------------------------")
	}
};

module.exports.tags = ["all", "mocks"];