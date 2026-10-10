import React from "react";
import { createRoot } from "react-dom/client";
import { ethers } from "ethers";
import "./style.css";
const ABI = [
 "function bet(uint256 numberToBet) payable",
 "function numberOfBets() view returns(uint256)",
 "function maxAmountOfBets() view returns(uint256)",
 "function minimumBet() view returns(uint256)",
 "function totalBet() view returns(uint256)",
 "function numberWinner() view returns(uint256)",
 "function roundFinished() view returns(bool)",
 "function winnings(address) view returns(uint256)",
 "function withdraw()"
];
function App(){
 const [address,setAddress]=React.useState("");
 const [contractAddress,setContractAddress]=React.useState(import.meta.env.VITE_CONTRACT_ADDRESS||"");
 const [account,setAccount]=React.useState("");
 const [number,setNumber]=React.useState(5);
 const [amount,setAmount]=React.useState("0.001");
 const [stats,setStats]=React.useState(null);
 const [message,setMessage]=React.useState("Connect your wallet to begin.");
 async function contract(){
  if(!window.ethereum) throw Error("Install MetaMask first.");
  if(!ethers.isAddress(contractAddress)) throw Error("Enter a valid deployed contract address.");
  const provider=new ethers.BrowserProvider(window.ethereum);
  const network=await provider.getNetwork();
  if(network.chainId!==11155111n) throw Error("Switch MetaMask to Sepolia.");
  return new ethers.Contract(contractAddress,ABI,await provider.getSigner());
 }
 async function connect(){
  try{
   if(!window.ethereum) throw Error("Install MetaMask first.");
   const a=await window.ethereum.request({method:"eth_requestAccounts"});
   setAccount(a[0]);setMessage("Wallet connected.");
  }catch(e){setMessage(e.shortMessage||e.message);}
 }
 async function refresh(){
  try{
   const c=await contract();
   const [n,max,min,total,winner,done,credit]=await Promise.all([
    c.numberOfBets(),c.maxAmountOfBets(),c.minimumBet(),c.totalBet(),
    c.numberWinner(),c.roundFinished(),c.winnings(await (await c.runner.getAddress()))
   ]);
   setStats({n:String(n),max:String(max),min:ethers.formatEther(min),total:ethers.formatEther(total),winner:String(winner),done,credit:ethers.formatEther(credit)});
   setMessage("Contract data updated.");
  }catch(e){setMessage(e.shortMessage||e.message);}
 }
 async function sendBet(){
  try{
   const c=await contract();setMessage("Confirm in MetaMask...");
   const tx=await c.bet(number,{value:ethers.parseEther(amount)});
   setMessage("Waiting for confirmation: "+tx.hash);
   await tx.wait();await refresh();setMessage("Bet confirmed! "+tx.hash);
  }catch(e){setMessage(e.shortMessage||e.message);}
 }
 async function withdraw(){
  try{
   const c=await contract();setMessage("Confirm withdrawal...");
   const tx=await c.withdraw();await tx.wait();await refresh();setMessage("Withdrawal confirmed: "+tx.hash);
  }catch(e){setMessage(e.shortMessage||e.message);}
 }
 return <main className="shell">
  <h1>Ethereum Casino DApp</h1>
  <p className="sub">Course lab · Sepolia test ETH only · Adapted from merlox/casino-ethereum</p>
  <section><h2>1. Wallet and Contract</h2>
   <button onClick={connect}>Connect MetaMask</button>
   <p className="small">{account||"No wallet connected"}</p>
   <label>Deployed contract address</label>
   <input value={contractAddress} onChange={e=>setContractAddress(e.target.value)} placeholder="0x..."/>
   <button onClick={refresh}>Load Contract Data</button>
  </section>
  <section><h2>2. Place a Bet</h2><p>Select a number between 1 and 10.</p>
   <div className="numbers">{Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} className={number===n?"selected":""} onClick={()=>setNumber(n)}>{n}</button>)}</div>
   <label>Amount (Sepolia ETH)</label>
   <input type="number" min="0" step="0.001" value={amount} onChange={e=>setAmount(e.target.value)}/>
   <button className="primary" onClick={sendBet}>Place Bet on {number}</button>
  </section>
  <section><h2>3. Round Status</h2>
   {stats?<div className="stats">
    <div>Bets: <b>{stats.n} / {stats.max}</b></div>
    <div>Minimum: <b>{stats.min} ETH</b></div>
    <div>Total staked: <b>{stats.total} ETH</b></div>
    <div>Finished: <b>{stats.done?"Yes":"No"}</b></div>
    <div>Winning number: <b>{stats.winner==="0"?"Not drawn":stats.winner}</b></div>
    <div>Your unclaimed prize: <b>{stats.credit} ETH</b></div>
   </div>:<p>Load contract data to view game status.</p>}
   <button onClick={withdraw}>Withdraw Winnings</button>
  </section>
  <p className="status">{message}</p>
  <p className="small">Educational demo. The owner must reveal a committed secret after all bets. This design is not safe for real-money use.</p>
 </main>;
}
createRoot(document.getElementById("root")).render(<App/>);
