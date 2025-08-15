// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title WANKR Token
 * @dev The Unholy Birth of WANKR GYATT - Base chain's least expected antihero
 * 
 * This token implements Proof of Shame (POS) mechanics:
 * - Standard send amount: 10 WANKR (the perfect shame amount)
 * - Top 50 Shame Soldiers leaderboard tracking
 * - Spectral judgment scale (1-10)
 * - Anti-engagement farming deterrents
 * - The Forbidden Send protection (69 WANKR)
 */
contract WANKRToken is ERC20, Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant STANDARD_SHAME_AMOUNT = 10 * 10**18; // 10 WANKR
    uint256 public constant FORBIDDEN_AMOUNT = 69 * 10**18; // 69 WANKR (never send this!)
    uint256 public constant MAX_SHAME_SOLDIERS = 50;
    
    // Events
    event ShameDelivered(address indexed from, address indexed to, uint256 amount, string reason);
    event ShameSoldierRanked(address indexed soldier, uint256 totalShameDelivered, uint256 rank);
    event ForbiddenSendAttempted(address indexed from, address indexed to, uint256 amount);
    event SpectralJudgment(address indexed target, uint8 judgment, string reason);
    
    // Structs
    struct ShameSoldier {
        address soldier;
        uint256 totalShameDelivered;
        uint256 lastShameTime;
        uint256 rank;
    }
    
    struct ShameRecord {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }
    
    // State variables
    mapping(address => uint256) public shameDelivered;
    mapping(address => uint256) public shameReceived;
    mapping(address => uint256) public soldierRank;
    mapping(uint256 => address) public rankToSoldier;
    
    ShameSoldier[] public topShameSoldiers;
    ShameRecord[] public shameHistory;
    
    uint256 public totalShameDelivered;
    uint256 public totalShameTransactions;
    
    // Modifiers
    modifier onlyValidAmount(uint256 amount) {
        require(amount > 0, "WANKR: Amount must be greater than 0");
        require(amount != FORBIDDEN_AMOUNT, "WANKR: The Forbidden Send is forbidden!");
        _;
    }
    
    modifier onlyValidAddress(address target) {
        require(target != address(0), "WANKR: Cannot shame the void");
        require(target != msg.sender, "WANKR: Cannot shame yourself (yet)");
        _;
    }
    
    constructor() ERC20("WANKR", "WANKR") Ownable(msg.sender) {
        _mint(msg.sender, 100_000_000_000 * 10**18); // 100 billion WANKR
    }
    
    /**
     * @dev Deliver shame with the standard 10 WANKR amount
     * @param to The address to shame
     * @param reason The reason for the shame (optional)
     */
    function deliverShame(address to, string memory reason) 
        external 
        onlyValidAmount(STANDARD_SHAME_AMOUNT)
        onlyValidAddress(to)
        nonReentrant 
    {
        _deliverShame(to, STANDARD_SHAME_AMOUNT, reason);
    }
    
    /**
     * @dev Deliver custom amount of shame (but never 69!)
     * @param to The address to shame
     * @param amount The amount of WANKR to send
     * @param reason The reason for the shame
     */
    function deliverCustomShame(address to, uint256 amount, string memory reason) 
        external 
        onlyValidAmount(amount)
        onlyValidAddress(to)
        nonReentrant 
    {
        _deliverShame(to, amount, reason);
    }
    
    /**
     * @dev Internal function to deliver shame and update leaderboard
     */
    function _deliverShame(address to, uint256 amount, string memory reason) internal {
        require(balanceOf(msg.sender) >= amount, "WANKR: Insufficient balance for shame");
        
        // Transfer tokens
        _transfer(msg.sender, to, amount);
        
        // Update shame statistics
        shameDelivered[msg.sender] += amount;
        shameReceived[to] += amount;
        totalShameDelivered += amount;
        totalShameTransactions++;
        
        // Record shame transaction
        shameHistory.push(ShameRecord({
            from: msg.sender,
            to: to,
            amount: amount,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        // Update leaderboard
        _updateShameLeaderboard(msg.sender);
        
        // Emit events
        emit ShameDelivered(msg.sender, to, amount, reason);
        
        // Spectral judgment (1-10 scale based on amount)
        uint8 judgment = _calculateSpectralJudgment(amount);
        emit SpectralJudgment(to, judgment, reason);
    }
    
    /**
     * @dev Calculate spectral judgment (1-10) based on shame amount
     */
    function _calculateSpectralJudgment(uint256 amount) internal pure returns (uint8) {
        if (amount <= 1 * 10**18) return 1; // Mildly Mid
        if (amount <= 5 * 10**18) return 5; // Moderately Wanker
        if (amount <= 10 * 10**18) return 8; // Pretty Wanker
        return 10; // Full Blown Wanker
    }
    
    /**
     * @dev Update the Top 50 Shame Soldiers leaderboard
     */
    function _updateShameLeaderboard(address soldier) internal {
        uint256 totalShame = shameDelivered[soldier];
        
        // Find if soldier is already in top 50
        uint256 existingIndex = type(uint256).max;
        for (uint256 i = 0; i < topShameSoldiers.length; i++) {
            if (topShameSoldiers[i].soldier == soldier) {
                existingIndex = i;
                break;
            }
        }
        
        if (existingIndex != type(uint256).max) {
            // Update existing soldier
            topShameSoldiers[existingIndex].totalShameDelivered = totalShame;
            topShameSoldiers[existingIndex].lastShameTime = block.timestamp;
        } else {
            // Add new soldier if there's space
            if (topShameSoldiers.length < MAX_SHAME_SOLDIERS) {
                topShameSoldiers.push(ShameSoldier({
                    soldier: soldier,
                    totalShameDelivered: totalShame,
                    lastShameTime: block.timestamp,
                    rank: 0
                }));
            }
        }
        
        // Sort leaderboard by total shame delivered
        _sortLeaderboard();
        
        // Update ranks
        for (uint256 i = 0; i < topShameSoldiers.length; i++) {
            topShameSoldiers[i].rank = i + 1;
            soldierRank[topShameSoldiers[i].soldier] = i + 1;
            rankToSoldier[i + 1] = topShameSoldiers[i].soldier;
            
            emit ShameSoldierRanked(
                topShameSoldiers[i].soldier, 
                topShameSoldiers[i].totalShameDelivered, 
                i + 1
            );
        }
    }
    
    /**
     * @dev Sort leaderboard by total shame delivered (descending)
     */
    function _sortLeaderboard() internal {
        for (uint256 i = 0; i < topShameSoldiers.length - 1; i++) {
            for (uint256 j = 0; j < topShameSoldiers.length - i - 1; j++) {
                if (topShameSoldiers[j].totalShameDelivered < topShameSoldiers[j + 1].totalShameDelivered) {
                    ShameSoldier memory temp = topShameSoldiers[j];
                    topShameSoldiers[j] = topShameSoldiers[j + 1];
                    topShameSoldiers[j + 1] = temp;
                }
            }
        }
        
        // Keep only top 50
        if (topShameSoldiers.length > MAX_SHAME_SOLDIERS) {
            // Resize array to keep only top 50
            uint256 excess = topShameSoldiers.length - MAX_SHAME_SOLDIERS;
            for (uint256 i = 0; i < excess; i++) {
                topShameSoldiers.pop();
            }
        }
    }
    
    /**
     * @dev Get top shame soldiers
     */
    function getTopShameSoldiers() external view returns (ShameSoldier[] memory) {
        return topShameSoldiers;
    }
    
    /**
     * @dev Get shame history
     */
    function getShameHistory() external view returns (ShameRecord[] memory) {
        return shameHistory;
    }
    
    /**
     * @dev Get shame statistics for an address
     */
    function getShameStats(address target) external view returns (
        uint256 delivered,
        uint256 received,
        uint256 rank
    ) {
        return (
            shameDelivered[target],
            shameReceived[target],
            soldierRank[target]
        );
    }
    
    /**
     * @dev Override transfer to prevent the forbidden send
     */
    function transfer(address to, uint256 amount) 
        public 
        virtual 
        override 
        onlyValidAmount(amount)
        onlyValidAddress(to)
        returns (bool) 
    {
        if (amount == FORBIDDEN_AMOUNT) {
            emit ForbiddenSendAttempted(msg.sender, to, amount);
            revert("WANKR: The Forbidden Send is forbidden!");
        }
        
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to prevent the forbidden send
     */
    function transferFrom(address from, address to, uint256 amount) 
        public 
        virtual 
        override 
        onlyValidAmount(amount)
        onlyValidAddress(to)
        returns (bool) 
    {
        if (amount == FORBIDDEN_AMOUNT) {
            emit ForbiddenSendAttempted(from, to, amount);
            revert("WANKR: The Forbidden Send is forbidden!");
        }
        
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev Emergency function to recover stuck tokens (only owner)
     */
    function emergencyRecover(address token, address to) external onlyOwner {
        require(token != address(this), "WANKR: Cannot recover WANKR tokens");
        uint256 balance = IERC20(token).balanceOf(address(this));
        IERC20(token).transfer(to, balance);
    }
}
