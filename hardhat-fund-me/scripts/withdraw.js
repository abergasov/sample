// списываем с контракта средства
const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract("FundMe", deployer)
	console.log("Withdrawing contract...")
	const txRespo = await fundMe.withdraw()
	await txRespo.wait(1)
	console.log("Withdrawed contract!")
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	})
