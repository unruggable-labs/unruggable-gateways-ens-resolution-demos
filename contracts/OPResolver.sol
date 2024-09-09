// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC165} from "@unruggable/lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol";
import {IExtendedResolver} from "@ensdomains/contracts/resolvers/profiles/IExtendedResolver.sol";
import {IAddrResolver} from "@ensdomains/contracts/resolvers/profiles/IAddrResolver.sol";
import {IAddressResolver} from "@ensdomains/contracts/resolvers/profiles/IAddressResolver.sol";

import {BytesUtils} from "@ensdomains/contracts/utils/BytesUtils.sol";
import {Strings} from "@unruggable/lib/openzeppelin-contracts/contracts/utils/Strings.sol";
import {GatewayFetcher, GatewayRequest} from "@unruggable/contracts/GatewayFetcher.sol";
import  "@unruggable/contracts/GatewayProtocol.sol";
import {GatewayFetchTarget, IGatewayProofVerifier} from "@unruggable/contracts/GatewayFetchTarget.sol";

import {console2 as console} from "forge-std/console2.sol"; // DEBUG


contract OPResolver is IERC165, IExtendedResolver, GatewayFetchTarget {
	using BytesUtils for bytes;
	using GatewayFetcher for GatewayRequest;

	IGatewayProofVerifier immutable _verifier;

	address constant STORAGE_CONTRACT_ADDRESS = 0xc695404735E0F1587A5398a06cAB34D7d7b009Da;

	constructor(IGatewayProofVerifier verifier) {
		console.log("Constructing OPResolver..");
        _verifier = verifier;
	}

    function supportsInterface(bytes4 x) external pure returns (bool) {
		return x == type(IERC165).interfaceId || x == type(IExtendedResolver).interfaceId;
	}

    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {

		bytes4 selector = bytes4(data);
        console.log("Resolving Selector: ");
        console.logBytes4(selector);

        if (selector == IAddrResolver.addr.selector || selector == IAddressResolver.addr.selector) {

            GatewayRequest memory baseRequest = GatewayFetcher.newRequest(3) //Three outputs (Registry, Resolver, Resolved)
                .setTarget(STORAGE_CONTRACT_ADDRESS); //From the storage contract
                
            //Output 0 will be the registry
            //In our example RegistryStorage.sol the root registry address is 0
            baseRequest.push(uint256(0)) //Push 0 to the stack
                .setOutput(uint8(0)); //Set it as the first output (and remove from stack)

            uint256 currentOffset = 0;
            //Push namehashes to the stack
            while (currentOffset != name.length - 1) {

                bytes32 levelNamehash = name.namehash(currentOffset); //Get the namehash

                baseRequest.push(levelNamehash); //Push it to the stack

                (, currentOffset) = name.readLabel(currentOffset); //Get the next label offset
            }
            
            baseRequest.push(uint8(0)); // add namehash for root
            baseRequest.setSlot(0); // registries mapping (map[registry][node])

            //At this point stack is namehashes e.g. clowes.eth, eth, ''

            //This subrequest will be evaluated against everything on the stack
            GatewayRequest memory subRequest = GatewayFetcher.newCommand()
                .pushOutput(0) // push output 0 (the parent registry) back onto the top of the stack
                .follow().follow() // Follows the registry and then the node (map[registry][node])
                .read() // resolver for the parent node (Resolver is index 0 in the struct). Pushed to stack
                .push(
                    //If there is a non zero (resolver) at the top of the stack save it as output 1
                    GatewayFetcher.newCommand()
                        .requireNonzero(uint8(0))
                        .setOutput(1)       
                ) // save nonzero resolver
                .evalLoop(uint8(0), uint8(1)) //evaluate command against the last item on the stack
                .offset(1).read() // registry
                .requireNonzero(uint8(0)) // require registry
                .setOutput(0); // save it
                
            
            baseRequest.push(subRequest).evalLoop(STOP_ON_FAILURE); // loop until we get a failure
            baseRequest.pushOutput(1).requireNonzero(uint8(0)).target() // set target to resolver
                .setSlot(0) // _nodes mapping (map[node])
                .push(name.namehash(0)).follow()
                .read().setOutput(2); // read resolved address into output 2

            fetch(_verifier, baseRequest, this.addrCallback.selector, abi.encodePacked(selector));
        }

		return new bytes(64);
	}

    function addrCallback(bytes[] calldata values, uint8, bytes calldata extraData) external pure returns (bytes memory) {

        console.log("3668 Callback");
		return bytes4(extraData) == IAddrResolver.addr.selector ? abi.encode(bytes32(values[2])) : abi.encode(values[2][12:]);
	}

    /**
     * Debug callback for returning all 3 addresses
    function debugCallback(bytes[] calldata values, uint8, bytes calldata) external pure returns (bytes memory) {
		return abi.encode(values);
	}
    */
}