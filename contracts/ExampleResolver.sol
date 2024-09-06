// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IExtendedResolver} from "@ensdomains/ens-contracts/contracts/resolvers/profiles/IExtendedResolver.sol";
import {IAddrResolver} from "@ensdomains/ens-contracts/contracts/resolvers/profiles/IAddrResolver.sol";
import {IAddressResolver} from "@ensdomains/ens-contracts/contracts/resolvers/profiles/IAddressResolver.sol";

// libraries
import {BytesUtils} from "@ensdomains/ens-contracts/contracts/utils/BytesUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {GatewayFetcher, GatewayRequest} from "@unruggable/gateways/contracts/GatewayFetcher.sol";
import  "@unruggable/gateways/contracts/GatewayProtocol.sol";

// bases
import {GatewayFetchTarget, IGatewayProofVerifier} from "@unruggable/gateways/contracts/GatewayFetchTarget.sol";

import "forge-std/console2.sol"; // DEBUG


contract ExampleResolver is IERC165, IExtendedResolver, GatewayFetchTarget {
	using BytesUtils for bytes;
	using GatewayFetcher for GatewayRequest;

	IGatewayProofVerifier immutable _verifier;
	address immutable _exampleAddress;

	constructor(IGatewayProofVerifier verifier, address exampleAddress) {
		_verifier = verifier;
        _exampleAddress = exampleAddress;
	}

    function supportsInterface(bytes4 x) external pure returns (bool) {
		return x == type(IERC165).interfaceId || x == type(IExtendedResolver).interfaceId;
	}

    function resolve(bytes calldata name, bytes calldata data) external view returns (bytes memory) {

        GatewayRequest memory r = GatewayFetcher
            .newRequest(1)
            .setTarget(_exampleAddress)
            .setSlot(11)
            .read()
            .debug("lol")
            .setOutput(0);

		fetch(_verifier, r, this.addrCallback.selector, '');    
		return new bytes(64);
	}

    function addrCallback(bytes[] calldata values, uint8, bytes calldata extraData) external pure returns (bytes memory) {
		return abi.encode(bytes32(values[0]));
	}
}