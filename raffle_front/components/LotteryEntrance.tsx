import { useWeb3Contract } from 'react-moralis'
import { abi, contractAddresses } from '../constants/index'
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { BigNumber, ethers, ContractTransaction } from "ethers"

interface contractAddressesInterface {
	[key: string]: string[]
}

export default function LotteryEntrance() {
	const address: contractAddressesInterface = contractAddresses
	const [entranceFee, setEntranceFee] = useState("0")
	const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
	const chainId: string = parseInt(chainIdHex!).toString()
	const raffleAddress = chainId in address ? address[chainId][0] : null
	console.log("chainId", parseInt(chainId), "raffleAddress", raffleAddress)

	const { runContractFunction:enterRaffle } = useWeb3Contract({
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

	async function UpdateUI() {
		const res = ((await getEntranceFee()) as BigNumber).toString()
		setEntranceFee(res)
		console.log("getEntranceFee", res)
	}

	useEffect(() => {
		if (isWeb3Enabled) {
			// try read contract parameters
			UpdateUI()
		}
	}, [isWeb3Enabled])

	return (
		<div>
			{raffleAddress ? (
				<div>
					Lottery entrance fee: {ethers.utils.formatUnits(entranceFee, 'ether')} ETH
					<br/>
					<button onClick={async function () {
						await enterRaffle({
						//	onSuccess: (tx) => handleSuccess(tx as ContractTransaction),
						})
					}}>Enter ruffle</button>
				</div>
			): (
				<div>No Raffle address in this network</div>
			)
			}
		</div>
	)
}