const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainID = network.config.chainId
	const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2")

	let vrfCoordinatorAddress, subscriptionID, vrfCoordinatorV2Mock

	if (developmentChains.includes(network.name)) {
		vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
		vrfCoordinatorAddress = vrfCoordinatorV2Mock.address

		// создание и пополнение подписки - это вызов методов смарт контракта
		// у мока дергаем метод и ловим эвент в логах. там будет subID
		const transactionResponse = await vrfCoordinatorV2Mock.createSubscription()
		const transactionReceipt = await transactionResponse.wait(1)
		subscriptionID = transactionReceipt.events[0].args.subId
		const res = await vrfCoordinatorV2Mock.fundSubscription(subscriptionID, VRF_SUB_FUND_AMOUNT)
		log("subscriptionID", subscriptionID)
	} else {
		vrfCoordinatorAddress = networkConfig[chainID]["vrfCoordinatorV2"]
		subscriptionID = networkConfig[chainID]["subscriptionID"]
	}

	const entranceFee = networkConfig[chainID]["entranceFee"]
	const gasLane = networkConfig[chainID]["gasLane"]
	const callbackGasLimit = networkConfig[chainID]["callbackGasLimit"]
	const interval = networkConfig[chainID]["interval"]
	const args = [vrfCoordinatorAddress, entranceFee, gasLane, callbackGasLimit, subscriptionID, interval]

	await deploy("Raffle", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.waitConfirmations || 1,
	});

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		log("Verifying contract...")
		await verify("Raffle", args)
		log("Contract verified!")
		log("------------------------------------")
	}
}

module.exports.tags = ["all", "raffle"]
