import { ethers } from "./ethers-5.6.esm.min.js"
//import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.esm.min.js";
import { abi, contractAddress } from "./consts.js"

const connBtn = document.getElementById("connect");
const fundBtn = document.getElementById("fund");
const balanceBtn = document.getElementById("balance");
const withdrawBtn = document.getElementById("withdraw");

connBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = balance;
withdrawBtn.onclick = withdraw;

async function connect() {
	if (typeof window.ethereum === "undefined") {
		console.log("No etherium provider found");
		return;
	}
	try {
		await window.ethereum.request({
			method: "eth_requestAccounts"
		});
		console.log("Connected");
	} catch (e) {
		console.log("error while connect", e);
	}
}

async function withdraw() {
	if (typeof window.ethereum === "undefined") {
		console.log("No etherium provider found");
		return;
	}

	try {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);

		const withRec = await contract.withdraw();
		await listenTx(withRec, provider);
		console.log("DONE");
		console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
	} catch (e) {
		console.log("error while balance", e);
	}
}

async function balance() {
	if (typeof window.ethereum === "undefined") {
		console.log("No etherium provider found");
		return;
	}

	try {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
		// const signer = provider.getSigner();
		// const contract = new ethers.Contract(contractAddress, abi, signer);
		// const balance = await contract.addressToAmountFunded(signer.getAddress());
		// console.log(`Balance: ${ethers.utils.formatEther(balance)}`);
	} catch (e) {
		console.log("error while balance", e);
	}
}

async function fund() {
	const ethAmount = document.getElementById("amount").value;
	if (typeof window.ethereum === "undefined") {
		console.log("No etherium provider found");
		return;
	}
	console.log(`Funding ${ethAmount}...`);
	const provider = new ethers.providers.Web3Provider(window.ethereum);
	const signer = provider.getSigner();
	const contract = new ethers.Contract(contractAddress, abi, signer);

	try {
		const txResp = await contract.fund({
			value: ethers.utils.parseEther(ethAmount)
		});
		await listenTx(txResp, provider);
		console.log("DONE");
	} catch (e) {
		console.log("error while fund", e);
	}
}

function listenTx(txResponse, provider) {
	console.log(`minig tx hash: ${txResponse.hash}...`);
	return new Promise((resolve, reject) => {
		provider.once(txResponse.hash, (txReceipt) => {
			console.log(`completed with confirmations: ${txReceipt.confirmations}`);
			resolve();
		});
	});
}