// Check if window.ethereum exists
export const isWalletDetected = () => typeof window.ethereum !== 'undefined';

export const connectWallet = async () => {
  if (!isWalletDetected()) {
    throw new Error("MetaMask is not installed");
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    return accounts[0];
  } catch (error) {
    throw new Error("Failed to connect wallet: " + error.message);
  }
};

export const checkConnection = async () => {
  if (!isWalletDetected()) return null;

  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Error checking connection:", error);
    return null;
  }
};

// Listen for account and chain changes
export const listenToWalletChanges = (onAccountChange, onChainChange) => {
  if (isWalletDetected()) {
    window.ethereum.on('accountsChanged', (accounts) => {
      onAccountChange(accounts.length > 0 ? accounts[0] : null);
    });

    window.ethereum.on('chainChanged', (chainId) => {
      // Reload page is recommended on chain change
      window.location.reload(); 
      if (onChainChange) onChainChange(chainId);
    });
  }
};