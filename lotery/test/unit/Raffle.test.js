const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { getNamedAccounts, deployments, network } = require("hardhat")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Raffle", async function () {
		let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval
		beforeEach(async () => {
			deployer = (await getNamedAccounts()).deployer
			await deployments.fixture(["mocks","all"])
			raffle = await ethers.getContract("Raffle")
			vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
			raffleEntranceFee = await raffle.getEntranceFee()
			interval = await raffle.getInterval()
		})

		describe("constructor", async function () {
			it("initializes the raffle correctly", async function () {
				const raffleState = await raffle.getRaffleState()
				assert.equal(raffleState.toString(), "0")
				assert.equal(interval.toString(), networkConfig[network.config.chainId]["interval"].toString())
			})
		})

		describe("enterRaffle", async function () {
			it("reverts when you don't pay enought", async function () {
				await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle__NotEnoughtETHEntered")
			})
			it("records players when they entered", async function () {
				await raffle.enterRaffle({ value: raffleEntranceFee })
				const raffleState = await raffle.getNumberOfPlayers()
				const player = await raffle.getPlayer(0)
				assert.equal(raffleState.toString(), "1")
				assert.equal(player, deployer)
			})
			it("emits event", async function() {
				await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.emit(
					raffle, "RaffleEnter"
				)
			})
			it("does not allow enter when it calculation", async function() {
				await raffle.enterRaffle({ value: raffleEntranceFee })
				// мотаем время и майним пустой блок
				await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
				await network.provider.send("evm_mine", [])

				await raffle.performUpkeep([])
				//await expect(raffle.enterRaffle({ value: raffleEntranceFee })).to.be.revertedWith("Raffle__AllBetsAreOff")
			})
		})
})