// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface to interact with our Token contract
interface IToken {
    function mint(address to, uint256 amount) external;
}

contract TokenFaucet {
    // Configuration Constants
    uint256 public constant FAUCET_AMOUNT = 10 * 10**18;    // 10 Tokens per claim
    uint256 public constant COOLDOWN_TIME = 24 hours;       // 24 hours wait
    uint256 public constant MAX_CLAIM_AMOUNT = 50 * 10**18; // 50 Tokens lifetime limit

    // State Variables
    IToken public token;
    address public admin;
    bool public isPaused;

    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    // Modifier to restrict admin-only functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor(address _tokenAddress) {
        token = IToken(_tokenAddress);
        admin = msg.sender;
        isPaused = false;
    }

    function requestTokens() external {
        require(!isPaused, "Faucet is paused");

        // FIX: Check specific Lifetime Limit FIRST to get the correct error message
        require(remainingAllowance(msg.sender) >= FAUCET_AMOUNT, "Lifetime limit reached");

        // THEN check the general claim conditions (like cooldown)
        require(canClaim(msg.sender), "Claim conditions not met");

        // Update state BEFORE interaction to prevent reentrancy
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        // Interact with Token contract
        token.mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) public view returns (bool) {
        if (isPaused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) public view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) {
            return 0;
        }
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external onlyAdmin {
        isPaused = _paused;
        emit FaucetPaused(_paused);
    }
}