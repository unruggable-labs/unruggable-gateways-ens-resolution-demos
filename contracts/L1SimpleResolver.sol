// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
 
import {GatewayFetcher, GatewayRequest} from "@unruggable/contracts/GatewayFetcher.sol";
import {GatewayFetchTarget, IGatewayVerifier} from "@unruggable/contracts/GatewayFetchTarget.sol";

import "forge-std/console2.sol"; // DEBUG

contract L1SimpleResolver is GatewayFetchTarget {
	using GatewayFetcher for GatewayRequest;

	IGatewayVerifier immutable _verifier;
	address immutable _exampleAddress;

	constructor(IGatewayVerifier verifier, address exampleAddress) {
		_verifier = verifier;
        _exampleAddress = exampleAddress;
	}

    function supportsInterface(bytes4 x) external pure returns (bool) {
		return x == 0x9061b923 ? false : true;
	}

    function addr(bytes32 node) public view returns (address) {

        GatewayRequest memory r = GatewayFetcher
            .newRequest(1)
            .setTarget(_exampleAddress)
            .setSlot(11)
            .read()
            .debug("lol")
            .setOutput(0);

		fetch(_verifier, r, this.addrCallback.selector);    
	}
	
    function addrCallback(bytes[] calldata values, uint8, bytes calldata extraData) external pure returns (address) {
        return abi.decode(values[0], (address));
	}
}