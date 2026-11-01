
require("dotenv").config();

const { Web3 } = require("web3");

const INFURA_URL = process.env.INFURA_URL;

if (!INFURA_URL) {
    throw new Error("Please set INFURA_URL in your .env file");
}

const web3 = new Web3(INFURA_URL);

async function findFirstContractCreation() {
    try {
        const latestBlock = await web3.eth.getBlockNumber();

        console.log("Connected to Ethereum Mainnet.");
        console.log("Latest block:", latestBlock.toString());
        console.log("Searching for the first contract creation transaction...");

        for (let i = 0n; i <= latestBlock; i++) {

            const block = await web3.eth.getBlock(i, true);

            if (!block) {
                continue;
            }

            const creationTx = block.transactions.find(
                tx => typeof tx !== "string" && tx.to === null
            );

            if (creationTx) {
                console.log("\nFirst contract creation transaction found!");
                console.log("Block number:", i.toString());
                console.log("Transaction hash:", creationTx.hash);
                console.log("Transaction index:", creationTx.transactionIndex);

                return;
            }
        }

        console.log("No contract creation transaction found.");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

findFirstContractCreation();
