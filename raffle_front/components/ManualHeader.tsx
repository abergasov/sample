import { useMoralis } from "react-moralis"
import { useEffect } from "react"

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