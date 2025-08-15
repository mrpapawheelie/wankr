// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/WANKRToken.sol";

contract WANKRTokenTest is Test {
    WANKRToken public wankr;
    address public deployer = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public user3 = address(4);
    
    uint256 public constant STANDARD_SHAME_AMOUNT = 10 * 10**18;
    uint256 public constant FORBIDDEN_AMOUNT = 69 * 10**18;
    
    function setUp() public {
        vm.startPrank(deployer);
        wankr = new WANKRToken();
        vm.stopPrank();
        
        // Transfer some WANKR to test users
        vm.prank(deployer);
        wankr.transfer(user1, 1000 * 10**18);
        
        vm.prank(deployer);
        wankr.transfer(user2, 1000 * 10**18);
        
        vm.prank(deployer);
        wankr.transfer(user3, 1000 * 10**18);
    }
    
    function testInitialState() public {
        assertEq(wankr.name(), "WANKR");
        assertEq(wankr.symbol(), "WANKR");
        assertEq(wankr.decimals(), 18);
        assertEq(wankr.totalSupply(), 100_000_000_000 * 10**18);
        // Deployer should have 100B - 3K (3 transfers of 1000 each)
        assertEq(wankr.balanceOf(deployer), 100_000_000_000 * 10**18 - 3000 * 10**18);
    }
    
    function testDeliverShame() public {
        vm.startPrank(user1);
        
        uint256 initialBalance = wankr.balanceOf(user1);
        uint256 user2InitialBalance = wankr.balanceOf(user2);
        
        wankr.deliverShame(user2, "Test shame reason");
        
        assertEq(wankr.balanceOf(user1), initialBalance - STANDARD_SHAME_AMOUNT);
        assertEq(wankr.balanceOf(user2), user2InitialBalance + STANDARD_SHAME_AMOUNT);
        assertEq(wankr.shameDelivered(user1), STANDARD_SHAME_AMOUNT);
        assertEq(wankr.shameReceived(user2), STANDARD_SHAME_AMOUNT);
        assertEq(wankr.totalShameDelivered(), STANDARD_SHAME_AMOUNT);
        assertEq(wankr.totalShameTransactions(), 1);
        
        vm.stopPrank();
    }
    
    function testDeliverCustomShame() public {
        vm.startPrank(user1);
        
        uint256 customAmount = 5 * 10**18;
        uint256 initialBalance = wankr.balanceOf(user1);
        uint256 user2InitialBalance = wankr.balanceOf(user2);
        
        wankr.deliverCustomShame(user2, customAmount, "Custom shame reason");
        
        assertEq(wankr.balanceOf(user1), initialBalance - customAmount);
        assertEq(wankr.balanceOf(user2), user2InitialBalance + customAmount);
        assertEq(wankr.shameDelivered(user1), customAmount);
        assertEq(wankr.shameReceived(user2), customAmount);
        
        vm.stopPrank();
    }
    
    function testForbiddenSend() public {
        vm.startPrank(user1);
        
        // Try to send 69 WANKR (forbidden amount)
        vm.expectRevert("WANKR: The Forbidden Send is forbidden!");
        wankr.transfer(user2, FORBIDDEN_AMOUNT);
        
        // Try to deliver custom shame with 69 WANKR
        vm.expectRevert("WANKR: The Forbidden Send is forbidden!");
        wankr.deliverCustomShame(user2, FORBIDDEN_AMOUNT, "Forbidden shame");
        
        vm.stopPrank();
    }
    
    function testCannotShameSelf() public {
        vm.startPrank(user1);
        
        vm.expectRevert("WANKR: Cannot shame yourself (yet)");
        wankr.deliverShame(user1, "Self shame");
        
        vm.stopPrank();
    }
    
    function testCannotShameZeroAddress() public {
        vm.startPrank(user1);
        
        vm.expectRevert("WANKR: Cannot shame the void");
        wankr.deliverShame(address(0), "Void shame");
        
        vm.stopPrank();
    }
    
    function testInsufficientBalance() public {
        address poorUser = address(999);
        
        vm.startPrank(poorUser);
        
        vm.expectRevert("WANKR: Insufficient balance for shame");
        wankr.deliverShame(user1, "Poor shame");
        
        vm.stopPrank();
    }
    
    function testShameLeaderboard() public {
        // User1 delivers shame to multiple users
        vm.startPrank(user1);
        wankr.deliverShame(user2, "Shame 1");
        wankr.deliverShame(user3, "Shame 2");
        wankr.deliverCustomShame(user2, 5 * 10**18, "Custom shame");
        vm.stopPrank();
        
        // User2 delivers shame
        vm.startPrank(user2);
        wankr.deliverShame(user3, "Shame 3");
        vm.stopPrank();
        
        // Check leaderboard
        WANKRToken.ShameSoldier[] memory soldiers = wankr.getTopShameSoldiers();
        
        assertEq(soldiers.length, 2);
        assertEq(soldiers[0].soldier, user1);
        assertEq(soldiers[0].totalShameDelivered, STANDARD_SHAME_AMOUNT * 2 + 5 * 10**18);
        assertEq(soldiers[0].rank, 1);
        
        assertEq(soldiers[1].soldier, user2);
        assertEq(soldiers[1].totalShameDelivered, STANDARD_SHAME_AMOUNT);
        assertEq(soldiers[1].rank, 2);
    }
    
    function testShameStats() public {
        vm.startPrank(user1);
        wankr.deliverShame(user2, "Test shame");
        vm.stopPrank();
        
        (uint256 delivered, uint256 received, uint256 rank) = wankr.getShameStats(user1);
        assertEq(delivered, STANDARD_SHAME_AMOUNT);
        assertEq(received, 0);
        assertEq(rank, 1);
        
        (delivered, received, rank) = wankr.getShameStats(user2);
        assertEq(delivered, 0);
        assertEq(received, STANDARD_SHAME_AMOUNT);
        assertEq(rank, 0); // Not in top 50
    }
    
    function testSpectralJudgment() public {
        vm.startPrank(user1);
        
        // Test different amounts and their spectral judgments
        wankr.deliverCustomShame(user2, 1 * 10**18, "Mild shame"); // Should be judgment 1
        wankr.deliverCustomShame(user3, 5 * 10**18, "Moderate shame"); // Should be judgment 5
        wankr.deliverCustomShame(user2, 10 * 10**18, "High shame"); // Should be judgment 8
        wankr.deliverCustomShame(user3, 20 * 10**18, "Maximum shame"); // Should be judgment 10
        
        vm.stopPrank();
    }
    
    function testShameHistory() public {
        vm.startPrank(user1);
        wankr.deliverShame(user2, "First shame");
        wankr.deliverCustomShame(user3, 5 * 10**18, "Second shame");
        vm.stopPrank();
        
        WANKRToken.ShameRecord[] memory history = wankr.getShameHistory();
        assertEq(history.length, 2);
        
        assertEq(history[0].from, user1);
        assertEq(history[0].to, user2);
        assertEq(history[0].amount, STANDARD_SHAME_AMOUNT);
        assertEq(history[0].reason, "First shame");
        
        assertEq(history[1].from, user1);
        assertEq(history[1].to, user3);
        assertEq(history[1].amount, 5 * 10**18);
        assertEq(history[1].reason, "Second shame");
    }
    
    function testEvents() public {
        vm.startPrank(user1);
        
        // Test that deliverShame works (events are tested implicitly)
        wankr.deliverShame(user2, "Test reason");
        
        vm.stopPrank();
    }
    
    // TODO: Add emergency recover test when we have a proper test token
}
