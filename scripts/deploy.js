const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  // 1. Deploy the Token Contract
  const Token = await hre.ethers.getContractFactory("YourToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`Token deployed to: ${tokenAddress}`);

  // 2. Deploy the Faucet Contract (Pass Token address to constructor)
  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log(`Faucet deployed to: ${faucetAddress}`);

  // 3. Grant Minting Role to Faucet (CRITICAL STEP)
  console.log("Linking Faucet to Token...");
  const tx = await token.setFaucet(faucetAddress);
  await tx.wait();
  console.log("Faucet set as minter in Token contract.");

  // 4. Save Contracts info for Frontend
  saveFrontendFiles(tokenAddress, faucetAddress);

  console.log("Deployment complete!");
  
  // Verification reminder
  console.log("\nTo verify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress}`);
  console.log(`npx hardhat verify --network sepolia ${faucetAddress} ${tokenAddress}`);
}

function saveFrontendFiles(tokenAddress, faucetAddress) {
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "utils");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const addresses = {
    Token: tokenAddress,
    TokenFaucet: faucetAddress,
  };

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(addresses, undefined, 2)
  );
  
  // Also save the ABI so the frontend knows how to talk to the contracts
  const TokenArtifact = artifacts.readArtifactSync("YourToken");
  const FaucetArtifact = artifacts.readArtifactSync("TokenFaucet");

  fs.writeFileSync(
    path.join(contractsDir, "YourToken.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
  fs.writeFileSync(
    path.join(contractsDir, "TokenFaucet.json"),
    JSON.stringify(FaucetArtifact, null, 2)
  );
  
  console.log("Artifacts and addresses saved to frontend/src/utils/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});