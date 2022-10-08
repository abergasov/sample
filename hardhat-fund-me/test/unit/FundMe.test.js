const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
	? describe.skip
	:	describe("FundMe", async function () {
	let fundMe
	let deployer
	let mockAggregator
	const sentAmount = ethers.utils.parseEther("0.1")
	beforeEach(async function () {
		// deploy FundMe contract using hardhat
		// const accounts = await ethers.getSigners() // получить фейковые аккаунты у поднятой сети
		deployer = (await getNamedAccounts()).deployer
		await deployments.fixture(["all"]) // запустить скрипт из папки deployments
		fundMe = await ethers.getContract("FundMe", deployer)
		mockAggregator = await ethers.getContract("MockV3Aggregator", deployer)
	})
	describe("constructor", async function () {
		it("should set the right address", async function () {
			const priceFeedAddress = await fundMe.i_priceFeed()
			assert.equal(priceFeedAddress, mockAggregator.address)
		})
		it("should returan correct version", async function() {
			const version = await fundMe.getVersion()
			assert.equal(version.toString(), "0")
		})
		it("fund small amount", async function() {
			await expect(fundMe.fund({
				value: ethers.utils.parseEther("0.000001")
			})).to.be.reverted;
			await expect(fundMe.fund({
				value: ethers.utils.parseEther("0.000001")
			})).to.be.revertedWith("You need to spend more ETH");
		})
		it("should fund and add to address", async function() {
			await fundMe.fund({
				value: sentAmount
			})
			const funder = await fundMe.funders(0)
			assert.equal(funder.toString(), deployer.toString())
			const amount = await fundMe.addressToAmountFunded(deployer)
			assert.equal(amount.toString(), sentAmount.toString())
		})
	})

	describe("withdraw", async function() {
		beforeEach(async function() {
			await fundMe.fund({ value: sentAmount })
			await fundMe.fund({ value: sentAmount })
			await fundMe.fund({ value: sentAmount })
		})
		it("should owner able to withdraw", async function() {
			const deployerBalanceBefore = await ethers.provider.getBalance(deployer)
			const contractBalanceBefore = await ethers.provider.getBalance(fundMe.address)
			assert.equal(contractBalanceBefore.toString(), sentAmount.mul(3).toString())

			const txRespo = await fundMe.withdraw()
			const txReceipt = await txRespo.wait(1)
			const { gasUsed, effectiveGasPrice } = txReceipt
			const gasCost = gasUsed.mul(effectiveGasPrice)

			const contractBalanceAfter = await ethers.provider.getBalance(fundMe.address)
			assert.equal(contractBalanceAfter.toString(), "0")

			const deployerBalanceAfter = await ethers.provider.getBalance(deployer)
			assert.isTrue(deployerBalanceAfter > deployerBalanceBefore)
			assert.equal(
				deployerBalanceBefore.add(contractBalanceBefore).sub(gasCost).toString(),
				deployerBalanceAfter.toString(),
			)
		})
		it("should not owner not able to withdraw", async function() {
			const accounts = await ethers.getSigners()
			for (let i = 1; i < accounts.length; i++) {
				const fundMeCon = await expect(fundMe.connect(accounts[i]).withdraw()).to.be.revertedWith("Only owner can withdraw")
			}
		})
	})
})