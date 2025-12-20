import { ethers } from "ethers";
import { getTokenContract, getFaucetContract, TOKEN_ADDRESS, FAUCET_ADDRESS } from "./contracts";

export function initializeEvalInterface() {
  window.__EVAL__ = {
    // 1. Connect Wallet
    connectWallet: async () => {
      if (!window.ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    },

    // 2. Request Tokens
    requestTokens: async () => {
      if (!window.ethereum) throw new Error("No wallet connected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = getFaucetContract(signer);
      
      try {
        const tx = await faucet.requestTokens();
        // Wait for transaction to be mined
        await tx.wait();
        return tx.hash;
      } catch (error) {
        // Extract meaningful error message
        throw new Error(error.reason || error.message);
      }
    },

    // 3. Get Balance
    getBalance: async (address) => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = getTokenContract(provider);
      const balance = await token.balanceOf(address);
      return balance.toString(); // Must return string as per requirement
    },

    // 4. Can Claim?
    canClaim: async (address) => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const faucet = getFaucetContract(provider);
      return await faucet.canClaim(address);
    },

    // 5. Remaining Allowance
    getRemainingAllowance: async (address) => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const faucet = getFaucetContract(provider);
      const allowance = await faucet.remainingAllowance(address);
      return allowance.toString();
    },

    // 6. Contract Addresses
    getContractAddresses: async () => {
      return {
        token: TOKEN_ADDRESS,
        faucet: FAUCET_ADDRESS
      };
    }
  };
  
  console.log("Evaluation Interface (window.__EVAL__) Initialized");
}