// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceAnchor
 * @dev Cryptographic timestamp anchoring for FinanceX ArgusFin Shield evidence packets.
 * Absolute Rule: The report and raw evidence remain off-chain. Only evidenceHash is anchored.
 */
contract EvidenceAnchor {
    struct AnchorRecord {
        uint256 timestamp;
        bytes32 schemaVersion;
        address anchorer;
        bool exists;
    }

    mapping(bytes32 => AnchorRecord) private _anchors;

    event EvidenceAnchored(
        bytes32 indexed evidenceHash,
        uint256 timestamp,
        bytes32 schemaVersion,
        address indexed anchorer
    );

    error InvalidZeroHash();
    error EvidenceAlreadyAnchored();

    /**
     * @dev Anchors a deterministic evidence hash on-chain.
     */
    function anchorEvidence(bytes32 evidenceHash, bytes32 schemaVersion) external returns (uint256) {
        if (evidenceHash == bytes32(0)) {
            revert InvalidZeroHash();
        }
        if (_anchors[evidenceHash].exists) {
            revert EvidenceAlreadyAnchored();
        }

        uint256 timestamp = block.timestamp;
        _anchors[evidenceHash] = AnchorRecord({
            timestamp: timestamp,
            schemaVersion: schemaVersion,
            anchorer: msg.sender,
            exists: true
        });

        emit EvidenceAnchored(evidenceHash, timestamp, schemaVersion, msg.sender);

        return timestamp;
    }

    /**
     * @dev Verifies an evidence hash on-chain.
     */
    function verifyAnchor(bytes32 evidenceHash) external view returns (
        bool exists,
        uint256 timestamp,
        bytes32 schemaVersion,
        address anchorer
    ) {
        AnchorRecord memory record = _anchors[evidenceHash];
        return (record.exists, record.timestamp, record.schemaVersion, record.anchorer);
    }
}
