// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 Million Tokens Cap
    address public faucet;

    // Constructor sets the name, symbol, and initial owner
    constructor() ERC20("MyToken", "MTK") Ownable(msg.sender) {
        // Initially, no faucet is set. We set it after deployment.
    }

    // Function to set the faucet address (only owner can call this)
    function setFaucet(address _faucet) external onlyOwner {
        faucet = _faucet;
    }

    // Mint function restricted to the faucet
    function mint(address to, uint256 amount) external {
        require(msg.sender == faucet, "Only faucet can mint");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}