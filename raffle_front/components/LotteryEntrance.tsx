import { useWeb3Contract } from 'react-moralis'
import { Moralis } from 'moralis'
import { abi, contractAddresses } from '../constants/index'
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { BigNumber, ethers, Contract, ContractTransaction, ContractInterface } from "ethers"
import { Bell, IPosition, notifyType, useNotification } from "web3uikit"

interface contractAddressesInterface {
	[key: string]: string[]
}

export default function LotteryEntrance() {
	const address: contractAddressesInterface = contractAddresses
	const [entranceFee, setEntranceFee] = useState("0")
	const [numPlayers, setNumPlayers] = useState("0")
	const [recentWinner, setRecentWinner] = useState("0")

	const dispatch = useNotification()

	const { chainId: chainIdHex, isWeb3Enabled, web3: provider } = useMoralis()
	const chainId: string = parseInt(chainIdHex!).toString()
	const raffleAddress = chainId in address ? address[chainId][0] : null
	console.log("chainId", parseInt(chainId), "raffleAddress", raffleAddress)
	useEffect(() => {
		if (!provider) return;
		const winnerPicked = ethers.utils.id("WinnerPicked(address)");
		const raffleEntered = ethers.utils.id("RaffleEnter(address)");
		const requestedRaffleWinner = ethers.utils.id("RequestedRaffleWinner(address)");
		provider.on({ address: raffleAddress!, topics: [winnerPicked] }, (log, event) => {
			console.log("--- log winnerPicked", log,event)
		})
		provider.on({ address: raffleAddress!, topics: [raffleEntered] }, (log, event) => {
			console.log("--- log raffleEntered", log,event)
		})
		provider.on({ address: raffleAddress!, topics: [requestedRaffleWinner] }, (log, event) => {
			console.log("--- log requestedRaffleWinner", log,event)
		})
	}, [provider])
	if (raffleAddress) {
		//console.log(provider)
		// const web3Provider = Moralis.web3Library.getDefaultProvider();
		// console.log("web3Provider", web3Provider)
		// web3Provider.on({
		// 	address: raffleAddress!,
		// 	topics: [
		// 		ethers.utils.id("RaffleEnter(address)"),
		// 	]
		// }, (log, event) => {
		// 	// Emitted whenever a DAI token transfer occurs
		// 	console.log("log", log)
		// 	console.log("event", event)
		// })
	}


	const { runContractFunction:enterRaffle, isLoading, isFetching } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress!,
		functionName: 'enterRaffle',
		params: {},
		msgValue: entranceFee,
	})

	const { runContractFunction:getEntranceFee } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress!,
		functionName: 'getEntranceFee',
		params: {},
	})

	const { runContractFunction:getNumberOfPlayers } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress!,
		functionName: 'getNumberOfPlayers',
		params: {},
	})

	const { runContractFunction:getRecentWinner } = useWeb3Contract({
		abi: abi,
		contractAddress: raffleAddress!,
		functionName: 'getRecentWinner',
		params: {},
	})

	async function UpdateUI() {
		const res = ((await getEntranceFee()) as BigNumber).toString()
		setEntranceFee(res)
		const numPlayersFromCall = ((await getNumberOfPlayers()) as BigNumber).toString()
		const recentWinnerFromCall = await getRecentWinner() as string
		setNumPlayers(numPlayersFromCall)
		setRecentWinner(recentWinnerFromCall)
	}
	//
	// const filter = {
	//     address: raffleAddress,
	//     topics: [
	//         // the name of the event, parnetheses containing the data type of each event, no spaces
	// 				ethers.utils.id("RaffleEnter(address)"),
	//     ],
	// }
	//
	// useEffect(() => {
	// 	if (isWeb3Enabled) return;
	// 	const web3Provider = Moralis.provider;
	// 	console.log("web3Provider", web3Provider)
	// 	if (!web3Provider) return;
	// }, [isWeb3Enabled])

	async function listenForEvents() {
		if (!isWeb3Enabled) return;
		const web3Provider = Moralis.web3;
		if (!web3Provider) return;
		const contract = new Contract(raffleAddress!, abi as ContractInterface, web3Provider);
		web3Provider.on({
			address: raffleAddress!,
			topics: [
				ethers.utils.id("RaffleEnter(address)"),
			]
		}, (log, event) => {
			// Emitted whenever a DAI token transfer occurs
			console.log("log", log)
			console.log("event", event)
		})
		// console.log("contract", contract)
		// await Moralis.start({
		// 	//apiKey: process.ENV.MORALIS_KEY,
		// 	// ...and any other configuration
		// });
		// const options = {
		// 	chainId: parseInt(chainId),
		// 	address: raffleAddress,
		// 	topic: ethers.utils.id("RaffleEnter(address)"),
		// 	limit: "3",
		// 	abi: abi,
		// };
		// const events = await Moralis.Web3API.native.getContractEvents(options);
		// console.log("events", events)
	}
	//let tx: ContractTransaction = await myToken.connect(accounts[0]).transfer(accounts[1].address, 1);

	// let receipt: ContractReceipt = await tx.wait();
	// console.log(receipt.events?.filter((x) => {return x.event == "Transfer"}));

	// async function startServer() {
	// 	try {
	// 		// await Moralis.start({
	// 		// 	serverUrl: "http://127.0.0.1:8545/",
	// 		// 	appId: "123",
	// 		// 	//appId: "LtCAPag9Kl1f9oOtxJ5jr7xV9KbuBJbSklemDqvK",
	// 		// });
	// 		const events = await Web3Api.native.getContractEvents({
	// 			chainId: chainIdHex,
	// 			address: raffleAddress!,
	// 			topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
	// 			limit: 3,
	// 			abi: abi,
	// 		});
	// 		console.log(events);
	// 	} catch(e) {
	// 		console.log('Error happend while connecting to the cloud server: ', e.message);
	// 	}
	// }
	// const fetchContractEvents = async () => {
	// 	await listenForEvents()
	// };
	//
	// fetchContractEvents()

	useEffect(() => {
		if (isWeb3Enabled && raffleAddress) {
			// try read contract parameters
			UpdateUI()
		}
	}, [isWeb3Enabled])

	const handleSuccess = async function (tx: ContractTransaction) {
		await tx.wait(1)
		console.log("tx", tx)
		handleNotification("success", "Transaction successful")
		await UpdateUI()
	}

	const handleNotification = (type: string, message: string) => {
		dispatch({
			type: type as notifyType,
			message: message,
			title: "tx notification",
			position: "topR" as IPosition,
			icon: <Bell fontSize={20} />,
		})
	}

	return (
		<div className="p-5">
			{raffleAddress ? (
				<div>
					Lottery address: {raffleAddress}
					<br/>
					Lottery entrance fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
					<br/>
					Number of players: {numPlayers}
					<br/>
					Recent winner: {recentWinner}
					<br/>
					<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 round ml-auto" onClick={async function () {
						await enterRaffle({
							onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
							onError: (error) => console.error(error),
						})
					}} disabled={isLoading || isFetching}>
						{isLoading || isFetching ? <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full">...</div> : "Enter Raffle"}
					</button>
				</div>
			): (
				<div>No Raffle address in this network</div>
			)
			}
		</div>
	)
}