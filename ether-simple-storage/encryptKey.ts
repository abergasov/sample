import { ethers } from "ethers";
import * as fs from "fs-extra";
import "dotenv/config";

async function main() {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    const encryptedJSONKey = await wallet.encrypt(process.env.PASWD, process.env.PRIVATE_KEY);
    console.log(encryptedJSONKey);
    fs.writeFileSync("./.encryptedKey.json", encryptedJSONKey);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
})