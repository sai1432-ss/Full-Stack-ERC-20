const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenFaucet System", function () {
  let Token, Faucet;
  let token, faucet;
  let owner, addr1, addr2;

  // Constants from your contract
  const FAUCET_AMOUNT = ethers.parseEther("10");
  const MAX_CLAIM_AMOUNT = ethers.parseEther("50");
  const COOLDOWN_TIME = 24 * 60 * 60; // 24 hours in seconds

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // 1. Deploy Token
    const TokenFactory = await ethers.getContractFactory("YourToken");
    token = await TokenFactory.deploy();
    await token.waitForDeployment();

    // 2. Deploy Faucet
    const FaucetFactory = await ethers.getContractFactory("TokenFaucet");
    faucet = await FaucetFactory.deploy(await token.getAddress());
    await faucet.waitForDeployment();

    // 3. Connect them: Set Faucet address in Token contract
    await token.setFaucet(await faucet.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      expect(await faucet.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct admin", async function () {
      expect(await faucet.admin()).to.equal(owner.address);
    });
  });

  describe("Core Functionality", function () {
    it("Should allow a user to claim tokens", async function () {
      await expect(faucet.connect(addr1).requestTokens())
        .to.emit(faucet, "TokensClaimed")
        .withArgs(addr1.address, FAUCET_AMOUNT, await time.latest());

      expect(await token.balanceOf(addr1.address)).to.equal(FAUCET_AMOUNT);
    });

    it("Should enforce the 24-hour cooldown", async function () {
      // First claim
      await faucet.connect(addr1).requestTokens();

      // Attempt second claim immediately
      await expect(
        faucet.connect(addr1).requestTokens()
      ).to.be.revertedWith("Claim conditions not met");
    });

    it("Should allow claiming again after 24 hours", async function () {
      // First claim
      await faucet.connect(addr1).requestTokens();

      // Fast-forward time by 24 hours + 1 second
      await time.increase(COOLDOWN_TIME + 1);

      // Second claim should succeed
      await expect(faucet.connect(addr1).requestTokens()).not.to.be.reverted;
      
      // Balance should be 20 tokens now
      expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("20"));
    });
  });

  describe("Limits and Security", function () {
    it("Should enforce lifetime claim limit (50 Tokens)", async function () {
      // Claim 5 times (Total 50)
      for (let i = 0; i < 5; i++) {
        await faucet.connect(addr1).requestTokens();
        await time.increase(COOLDOWN_TIME + 1);
      }

      // Check allowance is 0
      expect(await faucet.remainingAllowance(addr1.address)).to.equal(0);

      // 6th claim should fail
      await expect(
        faucet.connect(addr1).requestTokens()
      ).to.be.revertedWith("Lifetime limit reached");
    });

    it("Should allow admin to pause and unpause", async function () {
      // Admin pauses
      await expect(faucet.setPaused(true))
        .to.emit(faucet, "FaucetPaused")
        .withArgs(true);

      // User cannot claim
      await expect(
        faucet.connect(addr1).requestTokens()
      ).to.be.revertedWith("Faucet is paused");

      // Admin unpauses
      await faucet.setPaused(false);

      // User can claim again
      await expect(faucet.connect(addr1).requestTokens()).not.to.be.reverted;
    });

    it("Should prevent non-admins from pausing", async function () {
      await expect(
        faucet.connect(addr1).setPaused(true)
      ).to.be.revertedWith("Only admin can perform this action");
    });
  });
});