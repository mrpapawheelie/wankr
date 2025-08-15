// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/WANKRToken.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy WANKR Token
        WANKRToken wankr = new WANKRToken();
        
        vm.stopBroadcast();
        
        console.log("WANKR Token deployed at:", address(wankr));
        console.log("Contract address:", address(wankr));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
    }
}
