// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ScamRegistry
 * @dev Neutral, minimal on-chain registry of verified scam-related cryptographic hashes.
 * Absolute Rule: No raw personal data, names, phone numbers, or unmasked text stored on-chain.
 */
contract ScamRegistry is Ownable {
    struct RegistryEntry {
        bytes32 identifierType; // e.g. keccak256("URL_HASH"), keccak256("PHONE_HASH")
        bytes32 sourceRefHash;   // SHA-256 evidence report digest
        uint256 registeredAt;
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => RegistryEntry) private _registry;

    event ScamHashRegistered(
        bytes32 indexed scamHash,
        bytes32 indexed identifierType,
        bytes32 sourceRefHash,
        uint256 timestamp
    );

    event ScamHashRevoked(
        bytes32 indexed scamHash,
        uint256 timestamp
    );

    error InvalidZeroHash();
    error AlreadyRegistered();
    error NotRegistered();

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Registers a verified scam identifier hash.
     * Restricted to contract owner / authorized FinanceX issuer.
     */
    function registerScamHash(
        bytes32 scamHash,
        bytes32 identifierType,
        bytes32 sourceRefHash
    ) external onlyOwner {
        if (scamHash == bytes32(0)) {
            revert InvalidZeroHash();
        }
        if (_registry[scamHash].exists) {
            revert AlreadyRegistered();
        }

        _registry[scamHash] = RegistryEntry({
            identifierType: identifierType,
            sourceRefHash: sourceRefHash,
            registeredAt: block.timestamp,
            revoked: false,
            exists: true
        });

        emit ScamHashRegistered(scamHash, identifierType, sourceRefHash, block.timestamp);
    }

    /**
     * @dev Revokes a previously registered scam hash entry.
     */
    function revokeScamHash(bytes32 scamHash) external onlyOwner {
        if (!_registry[scamHash].exists) {
            revert NotRegistered();
        }

        _registry[scamHash].revoked = true;
        emit ScamHashRevoked(scamHash, block.timestamp);
    }

    /**
     * @dev Queries the registration status of a scam identifier hash.
     */
    function queryScamHash(bytes32 scamHash) external view returns (
        bool isRegistered,
        bytes32 identifierType,
        bytes32 sourceRefHash,
        uint256 registeredAt,
        bool revoked
    ) {
        RegistryEntry memory entry = _registry[scamHash];
        return (
            entry.exists && !entry.revoked,
            entry.identifierType,
            entry.sourceRefHash,
            entry.registeredAt,
            entry.revoked
        );
    }
}
