const { getWeth, AMOUNT } = require("./getWeth")
const { getNamedAccounts } = require("hardhat")

async function getLendingPoolAddress(){}

async function main () {
	// protocol treats everything as erc20 token
	await getWeth()
	const { deployer } = await getNamedAccounts()

	// lending pool address provider 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
	const lendingPool = await getLendingPool(deployer)
	console.log(`lendingPool ${lendingPool.address}`)

	// approve use token from wallet
	const wethTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
	approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
	console.log(`approveERC20 done`)
	console.log(`depositing...`)
	lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
	console.log(`deposited`)
}

async function getLendingPool(account) {
	const lendingPoolAddressProvider = await ethers.getContractAt(
		"ILendingPoolAddressesProvider",
		"0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
		account,
	)
	const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool()
	return await ethers.getContractAt("ILendingPool", lendingPoolAddress)
}

// contractAddress - какой контракт может исполнять функцию
// spenderAddress - кто получит результат работы
// amount - сколько
// account - кто платит за газ
async function approveERC20(contractAddress, spenderAddress, amount, account) {
	const erc20 = await ethers.getContractAt("IERC20", contractAddress, account)
	const tx = await erc20.approve(spenderAddress, amount)
	await tx.wait(1)
	console.log('approveERC20 done');
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	})