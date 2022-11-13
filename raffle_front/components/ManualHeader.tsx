import { useMoralis } from "react-moralis"
import { useEffect } from "react"
import { Moralis } from "moralis"
import { ethers } from "ethers"

export default function ManualHeader() {
	const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } = useMoralis()

	useEffect(() => {
		if (isWeb3Enabled) return;
		if (typeof window !== 'undefined') {
			if (window.localStorage.getItem('connected')) {
				console.log("ManualHeader: enableWeb3");
				enableWeb3()
			}
		}
	}, [isWeb3Enabled])

	useEffect(() => {
		Moralis.onAccountChanged((account) => {
			console.log("ManualHeader: Moralis.onAccountChanged");
			if (account === null) {
				window.localStorage.removeItem('connected')
				deactivateWeb3()
				console.log("no account found");
			}
		})
		const web3Provider = Moralis.web3Library.getDefaultProvider();
		console.log("web3Provider", web3Provider)
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
	}, [])

	return (
		<div>
			{account ? (<div>Connected to: {account}</div>) : (
				<button onClick={async () => {
					await enableWeb3();
					if (typeof window !== 'undefined') {
						window.localStorage.setItem('connected', 'injected');
					}
				}} disabled={isWeb3EnableLoading}>Connect</button>
			)}
		</div>
	)
}