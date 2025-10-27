// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CardPackFHE {
    address public owner;
    
    // Pack prices
    uint256 public constant PACK_PRICE_SMALL = 0.001 ether;
    uint256 public constant PACK_PRICE_MEDIUM = 0.01 ether;
    uint256 public constant PACK_PRICE_LARGE = 0.1 ether;
    
    // User balances (from selling cards)
    mapping(address => uint256) public userBalances;
    
    // Events
    event PackOpened(address indexed user, uint8 packType, uint256[] cardValues);
    event CardSold(address indexed user, uint256 value);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Open a pack and get random cards
    function openPack(uint8 packType) external payable returns (uint256[] memory) {
        require(packType >= 1 && packType <= 3, "Invalid pack type");
        
        uint256 requiredPrice;
        if (packType == 1) {
            requiredPrice = PACK_PRICE_SMALL;
        } else if (packType == 2) {
            requiredPrice = PACK_PRICE_MEDIUM;
        } else {
            requiredPrice = PACK_PRICE_LARGE;
        }
        
        require(msg.value >= requiredPrice, "Insufficient payment");
        
        // Generate 3 random cards
        uint256[] memory cardValues = new uint256[](3);
        
        for (uint i = 0; i < 3; i++) {
            uint256 randomValue = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                i
            ))) % 100;
            
            if (packType == 1) {
                // Pokemon pack: 0.001 (10%), 0.002 (40%), 0.0005 (50%)
                if (randomValue < 10) {
                    cardValues[i] = 0.001 ether;
                } else if (randomValue < 50) {
                    cardValues[i] = 0.002 ether;
                } else {
                    cardValues[i] = 0.0005 ether;
                }
            } else if (packType == 2) {
                // One Piece pack (medium): 0.01 (10%), 0.02 (40%), 0.005 (50%)
                if (randomValue < 10) {
                    cardValues[i] = 0.01 ether;
                } else if (randomValue < 50) {
                    cardValues[i] = 0.02 ether;
                } else {
                    cardValues[i] = 0.005 ether;
                }
            } else {
                // One Piece pack (large): 0.1 (10%), 0.2 (40%), 0.05 (50%)
                if (randomValue < 10) {
                    cardValues[i] = 0.1 ether;
                } else if (randomValue < 50) {
                    cardValues[i] = 0.2 ether;
                } else {
                    cardValues[i] = 0.05 ether;
                }
            }
        }
        
        emit PackOpened(msg.sender, packType, cardValues);
        return cardValues;
    }
    
    // Sell a card and add value to user balance
    function sellCard(uint256 cardValue) external {
        require(cardValue > 0, "Invalid card value");
        userBalances[msg.sender] += cardValue;
        emit CardSold(msg.sender, cardValue);
    }
    
    // Withdraw balance to wallet
    function withdraw() external {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        require(address(this).balance >= balance, "Insufficient contract balance");
        
        userBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(msg.sender, balance);
    }
    
    // Get user balance
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    // Owner can withdraw contract profits
    function ownerWithdraw() external {
        require(msg.sender == owner, "Only owner");
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}
