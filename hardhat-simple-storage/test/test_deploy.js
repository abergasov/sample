const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("Simple storage", function(){
	let storageFactory, storage;
	beforeEach(async function(){
		storageFactory = await ethers.getContractFactory("SimpleStorage")
		storage = await storageFactory.deploy()
	})
	it("Should return 0", async function() {
		expect(await storage.retrieve()).to.equal(0)
		assert.equal((await storage.retrieve()).toString(), "0")
	})
	it("Should store value", async function() {
		const txResp = await storage.store(42);
		await txResp.wait(1);

		expect(await storage.retrieve()).to.equal(42)
		assert.equal((await storage.retrieve()).toString(), "42")
	})
	it("Should add person", async function() {
		let txResp = await storage.addPerson("Ivan", 42);
		await txResp.wait(1);
		txResp = await storage.addPerson("Petr", 12);
		await txResp.wait(1);

		let personA = await storage.people(0)
		assert.equal(personA.name, "Ivan")
		assert.equal(personA.favoriteNumber, "42")

		let personB = await storage.people(1)
		assert.equal(personB.name, "Petr")
		assert.equal(personB.favoriteNumber, "12")
	})
})