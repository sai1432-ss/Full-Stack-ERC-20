import { ethers } from 'ethers';
import TokenArtifact from './YourToken.json';
import FaucetArtifact from './TokenFaucet.json';

// Configuration: Read from .env file
// (Make sure your frontend/.env file has these variables!)
export const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
export const FAUCET_ADDRESS = import.meta.env.VITE_FAUCET_ADDRESS;

// Debugging: This will print the addresses to the console so you can verify them
console.log("--- DEBUGGING CONTRACTS ---");
console.log("Using Token Address:", TOKEN_ADDRESS);
console.log("Using Faucet Address:", FAUCET_ADDRESS);
console.log("---------------------------");

// 1. Get Provider
export const getProvider = () => {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  return new ethers.BrowserProvider(window.ethereum);
};

// 2. Get Signer
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// 3. Contract Instances
export const getTokenContract = async (providerOrSigner) => {
  const signer = providerOrSigner || await getSigner();
  return new ethers.Contract(TOKEN_ADDRESS, TokenArtifact.abi, signer);
};

export const getFaucetContract = async (providerOrSigner) => {
  const signer = providerOrSigner || await getSigner();
  return new ethers.Contract(FAUCET_ADDRESS, FaucetArtifact.abi, signer);
};

// 4. Contract Interaction Functions
export const getBalance = async (address) => {
  const provider = getProvider(); // Read-only calls can use provider
  const token = new ethers.Contract(TOKEN_ADDRESS, TokenArtifact.abi, provider);
  const balance = await token.balanceOf(address);
  return ethers.formatEther(balance);
};

export const canClaim = async (address) => {
  const provider = getProvider();
  const faucet = new ethers.Contract(FAUCET_ADDRESS, FaucetArtifact.abi, provider);
  return await faucet.canClaim(address);
};

export const getRemainingAllowance = async (address) => {
  const provider = getProvider();
  const faucet = new ethers.Contract(FAUCET_ADDRESS, FaucetArtifact.abi, provider);
  const allowance = await faucet.remainingAllowance(address);
  return ethers.formatEther(allowance);
};

export const requestTokens = async () => {
  const signer = await getSigner();
  const faucet = await getFaucetContract(signer);
  
  // Return the transaction response object
  return await faucet.requestTokens();
};

// 5. Event Listener
export const listenToEvents = async (onTokensClaimed) => {
  const provider = getProvider();
  const faucet = new ethers.Contract(FAUCET_ADDRESS, FaucetArtifact.abi, provider);

  faucet.on("TokensClaimed", (user, amount, timestamp) => {
    // Only trigger if the connected user is the one claiming (optional filter)
    console.log(`Tokens claimed by ${user}`);
    if (onTokensClaimed) onTokensClaimed();
  });
};