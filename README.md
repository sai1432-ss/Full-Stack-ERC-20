#Web3 Token Faucet (Sepolia)

A decentralized application (DApp) that allows users to claim custom ERC-20 tokens (**MTK**) on the Ethereum Sepolia Testnet. Built with Solidity, Hardhat, React, and Docker.

---

## Features

* **ERC-20 Token:** Custom "MyToken" (MTK) smart contract.
* **Faucet Logic:** Users can claim **10 MTK** every 24 hours (with a global limit of 50 MTK per user).
* **Wallet Integration:** Seamless connection with **MetaMask**.
* **Real-time Updates:** Auto-refreshes balances and cooldown status after transactions.
* **Responsive UI:** Clean interface built with React + Vite.
* **Dockerized:** Production-ready container setup using Nginx.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Ethers.js (v6)
* **Smart Contracts:** Solidity (v0.8.28), Hardhat
* **Network:** Ethereum Sepolia Testnet
* **Infrastructure:** Docker, Docker Compose

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [MetaMask](https://metamask.io/) Browser Extension
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Optional, for containerization)

---

## 📥 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone (https://github.com/sai1432-ss/Full-Stack-ERC-20.git)
    cd Full-Stack-ERC-20
    ```

2.  **Install Dependencies:**
    ```bash
    # Install Root/Hardhat dependencies
    npm install

    # Install Frontend dependencies
    cd frontend
    npm install
    cd ..
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the **`frontend/`** folder:
    ```env
    # frontend/.env
    VITE_TOKEN_ADDRESS=0xYourTokenAddressHere
    VITE_FAUCET_ADDRESS=0xYourFaucetAddressHere
    ```
    *(Note: If running locally with Hardhat node, update these with the local deployment addresses.)*

---

## 🖥️ Running Locally (Development)

### 1. Start Local Blockchain (Optional)
If you want to test without spending Sepolia ETH:
```bash
npx hardhat node
2. Deploy Contracts
Open a new terminal and deploy the contracts:

Bash

# For Localhost
npx hardhat run scripts/deploy.js --network localhost

# For Sepolia Testnet
npx hardhat run scripts/deploy.js --network sepolia
3. Start Frontend
Bash

cd frontend
npm run dev
Open http://localhost:5173 in your browser.

🐳 Running with Docker
This project is fully containerized. You can run the production build using Docker Compose.

Build and Run:

Bash

docker-compose up --build
Access the App: Open http://localhost:3000 in your browser.

Note: The Docker container uses Nginx to serve the optimized production build.

📜 Smart Contracts
1. MyToken (MTK)
A standard ERC-20 token with a fixed supply.

Symbol: MTK

Supply: 1,000,000

2. TokenFaucet
Controls the distribution rules:

Drip Amount: 10 MTK

Cooldown: 1 minute (configurable)

Max Allowance: 50 MTK per user

📂 Project Structure
Bash

├── contracts/          # Solidity Smart Contracts
│   ├── Token.sol
│   └── TokenFaucet.sol
├── scripts/            # Deployment Scripts
│   └── deploy.js
├── frontend/           # React Frontend Application
│   ├── src/
│   ├── Dockerfile      # Frontend Docker config
│   └── nginx.conf      # Nginx server config
├── hardhat.config.js   # Hardhat configuration
└── docker-compose.yml  # Docker Compose orchestration
🛡️ Troubleshooting
"Bad Data" / Error fetching blockchain data:

Ensure MetaMask is connected to the correct network (Sepolia).

Verify the addresses in frontend/.env match your deployment.

Transactions Failing:

Check if you have enough Sepolia ETH for gas fees.

Ensure the Faucet contract has enough MTK tokens (you may need to transfer some from the deployer account).
