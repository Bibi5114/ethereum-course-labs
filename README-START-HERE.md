# Casino Ethereum — course adaptation

Adapted from the original **merlox/casino-ethereum** project uploaded by the student.
Original project: https://github.com/merlox/casino-ethereum

## What was changed
- Solidity 0.4.11 -> Solidity 0.8.20.
- Removed deprecated Oraclize and Ropsten integration.
- React 15/Web3 0.20 -> React 18/Ethers 6/Vite.
- Added Sepolia wallet support and prize withdrawal.
- Contract supports 1–100 bets per round, set during deployment.

## Important limitation
This is a **course demonstration**, not a secure gambling product.
The owner commits to a secret before deployment and reveals it after all bets. The owner can
refuse to reveal, causing funds to be locked. There is no automatic timeout or refund.
A single wallet can bet once. 100 bets require 100 separate addresses.
There is no next-round reset; deploy a new contract for another round.
When no player chose the winning number, funds remain locked.
Never use real ETH.

## Quick start
1. Install Node.js LTS.
2. Open this folder in VS Code and run `npm install`, then `npm run dev`.
3. Open `https://remix.ethereum.org`, create `Casino.sol`, paste `contracts/Casino.sol`.
4. Compile with Solidity 0.8.20+ (0.8.x).
5. In Remix VM first deploy using:
   - `_minimumBet`: `1000000000000000` (0.001 ETH)
   - `_maxAmountOfBets`: `2` for a quick demo; `100` for assignment requirement
   - `_commitment`: use the hash generated below.
6. To create a commitment, in a browser developer console with ethers unavailable, use Remix's Solidity helper or the command below after `npm install`:

   `node -e "const {ethers}=require('ethers'); const secret=ethers.hexlify(ethers.randomBytes(32)); console.log('SECRET:',secret); console.log('COMMITMENT:',ethers.keccak256(ethers.solidityPacked(['bytes32'],[secret])));"`

   **Save SECRET privately**, and pass COMMITMENT to constructor. Never post the secret before all bets are placed.
7. For a public deployment choose Sepolia in MetaMask and Injected Provider in Remix.
8. Copy the new contract address into the website, connect MetaMask, and test.
9. Once all bets have been placed, owner calls `revealAndFinish(secret)` in Remix, using the saved SECRET.
10. Winners call `withdraw()` via the website.
11. Run `npm run build` to generate `dist/`, which can be uploaded to IPFS.

## Caveats
- For a fast 2-bet demo you need two different wallet addresses.
- The original tutorial used Oraclize for randomness; this classroom replacement is NOT an equivalent secure oracle.
- If the owner does not reveal, winnings cannot be paid out.
- Never upload wallet seed phrases, private keys, or `.env` files.
- Keep the original author's attribution in your submission.
