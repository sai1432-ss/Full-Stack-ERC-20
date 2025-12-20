import { useState, useEffect, useCallback } from 'react';
import { initializeEvalInterface } from './utils/eval';
import { 
  connectWallet, 
  checkConnection, 
  listenToWalletChanges 
} from './utils/wallet';
import { 
  getBalance, 
  canClaim, 
  getRemainingAllowance, 
  requestTokens, 
  listenToEvents 
} from './utils/contracts';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [allowance, setAllowance] = useState("0");
  const [canClaimStatus, setCanClaimStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Function to fetch all blockchain data
  const updateData = useCallback(async (userAddress) => {
    if (!userAddress) return;
    try {
      // These functions now return formatted strings directly from contracts.js
      const bal = await getBalance(userAddress);
      const allow = await getRemainingAllowance(userAddress);
      const status = await canClaim(userAddress);

      setBalance(bal);
      setAllowance(allow);
      setCanClaimStatus(status);
    } catch (err) {
      console.error("Error fetching blockchain data:", err);
    }
  }, []);

  // Initial Setup (Runs once)
  useEffect(() => {
    // 1. Initialize the Grading Interface
    initializeEvalInterface();

    // 2. Check if wallet is already connected
    const checkWallet = async () => {
      const connectedAddress = await checkConnection();
      if (connectedAddress) {
        setAccount(connectedAddress);
        updateData(connectedAddress);
      }
    };
    checkWallet();

    // 3. Setup Listeners
    listenToWalletChanges(
      (newAccount) => {
        setAccount(newAccount);
        if (newAccount) {
          updateData(newAccount);
        } else {
          setBalance("0");
          setAllowance("0");
        }
      },
      (chainId) => window.location.reload() // Reload on network change
    );

    // 4. Listen for Claim Events to auto-refresh UI
    listenToEvents(() => {
      if (account) updateData(account);
    });

  }, [updateData, account]);

  const handleConnect = async () => {
    setError("");
    try {
      const address = await connectWallet();
      setAccount(address);
      await updateData(address);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    
    try {
      // Use the modular function from contracts.js
      const tx = await requestTokens();
      
      // Wait for transaction to be mined
      await tx.wait();

      setSuccessMsg("Tokens claimed successfully!");
      
      // Refresh data immediately
      await updateData(account);
    } catch (err) {
      console.error(err);
      // specific error handling
      if (err.reason) {
        setError(err.reason);
      } else if (err.message && err.message.includes("user rejected")) {
        setError("Transaction rejected by user.");
      } else {
        setError("Transaction failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Web3 Token Faucet</h1>
      
      {/* Wallet Connection */}
      {!account ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <button 
            onClick={handleConnect}
            style={{ 
              padding: "12px 24px", 
              fontSize: "16px", 
              cursor: "pointer",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px"
            }}
          >
            Connect Wallet
          </button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      ) : (
        <div>
          <div style={{ 
            background: "#f5f5f5", 
            padding: "10px", 
            borderRadius: "4px", 
            marginBottom: "20px",
            wordBreak: "break-all" 
          }}>
            <p style={{ margin: 0 }}><strong>Connected:</strong> {account}</p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <h3 style={{ color: "#555" }}>My Balance</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>{balance} MTK</p>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <h3 style={{ color: "#555" }}>Limit Left</h3>
              <p style={{ fontSize: "24px", fontWeight: "bold", margin: "5px 0" }}>{allowance} MTK</p>
            </div>
          </div>

          {/* Action Area */}
          <div style={{ textAlign: "center" }}>
             <button 
              onClick={handleClaim} 
              disabled={loading || !canClaimStatus}
              style={{ 
                padding: "15px 40px", 
                fontSize: "18px", 
                backgroundColor: canClaimStatus ? "#4CAF50" : "#9e9e9e",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: canClaimStatus ? "pointer" : "not-allowed",
                transition: "background-color 0.3s"
              }}
            >
              {loading ? "Processing..." : canClaimStatus ? "Claim 10 Tokens" : "Cooldown Active / Limit Reached"}
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "4px" }}>
              Error: {error}
            </div>
          )}
          {successMsg && (
            <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#e8f5e9", color: "#2e7d32", borderRadius: "4px" }}>
              {successMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;