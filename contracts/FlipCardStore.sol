// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FlipCardStore - simple pack-opening contract with buy/sell/withdraw on Sepolia
/// @notice Uses FHE imports (per your request) but main economic logic uses native ETH for simplicity
contract FlipCardStore is SepoliaConfig {
    address public owner;

    // user withdrawable balance (in wei)
    mapping(address => uint256) public balanceOf;

    // last opened card per user (transient until sold)
    struct OpenedCard {
        bool exists;
        uint8 packType;
        uint8 cardIndex;
        uint256 cardValue;
    }
    mapping(address => OpenedCard) public lastOpened;

    // pack prices (wei)
    uint256 public constant PACK_SMALL = 1e15; // 0.001 ETH
    uint256 public constant PACK_MED = 1e16; // 0.01 ETH
    uint256 public constant PACK_LARGE = 1e17; // 0.1 ETH

    event PackPurchased(address indexed user, uint8 packType, uint256 paid);
    event CardOpened(address indexed user, uint8 packType, uint8 cardIndex, uint256 cardValue);
    event CardSold(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(){
        owner = msg.sender;
    }

    // ---------------------- user flows ----------------------

    /// @notice Buy a pack and open exactly one card (on-chain randomness using block data - demo only)
    /// @param packType 0 = small, 1 = med, 2 = large
    function buyAndOpen(uint8 packType) external payable {
        uint256 price = getPackPrice(packType);
        require(msg.value == price, "Incorrect ETH amount");

        // Emit purchase
        emit PackPurchased(msg.sender, packType, msg.value);

        // pseudo-random (DEMO) - do NOT use in prod
        uint256 r = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, msg.value)));

        // pick card index based on pack probabilities
        (uint8 chosen, uint256 cardValue) = pickCard(packType, r);

        // store last opened for the user until they sell it
        lastOpened[msg.sender] = OpenedCard({exists: true, packType: packType, cardIndex: chosen, cardValue: cardValue});

        emit CardOpened(msg.sender, packType, chosen, cardValue);
    }

    /// @notice Sell the last opened card immediately and credit withdrawable balance
    function sellLastOpened() external {
        OpenedCard memory oc = lastOpened[msg.sender];
        require(oc.exists, "No opened card to sell");

        // credit balance
        balanceOf[msg.sender] += oc.cardValue;

        // clear lastOpened
        delete lastOpened[msg.sender];

        emit CardSold(msg.sender, oc.cardValue);
    }

    /// @notice Withdraw accumulated balance to caller
    function withdraw() external {
        uint256 amount = balanceOf[msg.sender];
        require(amount > 0, "No balance to withdraw");

        // zero first to prevent reentrancy
        balanceOf[msg.sender] = 0;

        (bool ok, ) = payable(msg.sender).call{value: amount}('');
        require(ok, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // ---------------------- view / helpers ----------------------

    function getPackPrice(uint8 packType) public pure returns (uint256) {
        if (packType == 0) return PACK_SMALL;
        if (packType == 1) return PACK_MED;
        if (packType == 2) return PACK_LARGE;
        revert("Invalid pack type");
    }

    // pick card index and value according to probabilities described in spec
    function pickCard(uint8 packType, uint256 randomness) internal pure returns (uint8, uint256) {
        // normalize to 0..99
        uint256 r = randomness % 100;

        if (packType == 0) {
            // small pack: three pokemon cards: 0.001, 0.002, 0.0005 ETH; probs 10%,40%,50%
            if (r < 10) return (0, 1e15); // 10% -> 0.001
            else if (r < 50) return (1, 2e15); // next 40% -> 0.002
            else return (2, 5e14); // remaining 50% -> 0.0005
        } else if (packType == 1) {
            // med pack: one piece cards: 0.01, 0.02, 0.005 ETH; probs 10%,40%,50%
            if (r < 10) return (0, 1e16);
            else if (r < 50) return (1, 2e16);
            else return (2, 5e15);
        } else if (packType == 2) {
            // large pack: one piece cards: 0.1, 0.2, 0.05 ETH; probs 10%,40%,50%
            if (r < 10) return (0, 1e17);
            else if (r < 50) return (1, 2e17);
            else return (2, 5e16);
        }

        revert("Invalid pack type");
    }

    // Allow contract to receive ETH (e.g., in case someone sends by mistake)
    receive() external payable {}
}
