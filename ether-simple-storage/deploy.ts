import { ethers } from "ethers";
import * as fs from "fs-extra";
import "dotenv/config";

async function main() {
    console.log("Deploying SimpleStorage contract...");
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL!);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const abi = await fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
    const bytecode = await fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8");

    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
    console.log("Deploying contract...");
    const contract = await contractFactory.deploy(); // stop execution until deployed.
    console.log("Contract deployed to address: ", contract.address);
    const transactionReceipt = await contract.deployTransaction.wait(1);
    console.log("Contract deployed receipt: ", transactionReceipt);

    const favNum = await contract.retrieve();
    console.log(`Favorite number: ${favNum.toString()}`);

    // update variable inside contract
    const txUpdate = await contract.store("42")
    const transactionReceipt_ = await txUpdate.wait()
    txUpdate.wait(2);
    console.log(`Transaction receipt: ${transactionReceipt_.toString()}`);

    const favNumUpdated = await contract.retrieve()
    console.log("====================================");
    console.log(`New Favorite Number: ${favNumUpdated.toString()}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
})