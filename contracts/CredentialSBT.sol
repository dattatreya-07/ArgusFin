// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CredentialSBT
 * @dev Soulbound (non-transferable) ERC-721 token representing FinanceX learning credentials.
 * Absolute Rule: No personal identifiers (PII) are stored on-chain.
 */
contract CredentialSBT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct CredentialData {
        address recipient;
        string credentialType;
        bytes32 achievementHash;
        uint256 issuedAt;
        bool revoked;
    }

    mapping(uint256 => CredentialData) private _credentials;

    event CredentialIssued(
        uint256 indexed tokenId,
        address indexed recipient,
        string credentialType,
        bytes32 achievementHash,
        uint256 timestamp
    );

    event CredentialRevoked(
        uint256 indexed tokenId,
        uint256 timestamp
    );

    error NonTransferable();
    error CredentialDoesNotExist();
    error AlreadyRevoked();

    constructor(address initialOwner) ERC721("FinanceX Soulbound Credential", "FXSBT") Ownable(initialOwner) {}

    /**
     * @dev Enforces Soulbound non-transferable behavior.
     * Tokens can only be minted (from == address(0)) or burned (to == address(0)).
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert NonTransferable();
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Mints a non-transferable Soulbound credential to recipient.
     * Restricted to contract owner / authorized FinanceX issuer.
     */
    function mintCredential(
        address recipient,
        string memory credentialType,
        bytes32 achievementHash
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(bytes(credentialType).length > 0, "Empty credential type");
        require(achievementHash != bytes32(0), "Invalid achievement hash");

        _nextTokenId++;
        uint256 newTokenId = _nextTokenId;

        _safeMint(recipient, newTokenId);

        _credentials[newTokenId] = CredentialData({
            recipient: recipient,
            credentialType: credentialType,
            achievementHash: achievementHash,
            issuedAt: block.timestamp,
            revoked: false
        });

        emit CredentialIssued(newTokenId, recipient, credentialType, achievementHash, block.timestamp);

        return newTokenId;
    }

    /**
     * @dev Revokes an issued credential.
     */
    function revokeCredential(uint256 tokenId) external onlyOwner {
        if (_ownerOf(tokenId) == address(0)) {
            revert CredentialDoesNotExist();
        }
        if (_credentials[tokenId].revoked) {
            revert AlreadyRevoked();
        }

        _credentials[tokenId].revoked = true;
        emit CredentialRevoked(tokenId, block.timestamp);
    }

    /**
     * @dev Returns public verification details for a credential token.
     */
    function getCredential(uint256 tokenId) external view returns (
        address recipient,
        string memory credentialType,
        bytes32 achievementHash,
        uint256 issuedAt,
        bool revoked
    ) {
        if (_ownerOf(tokenId) == address(0)) {
            revert CredentialDoesNotExist();
        }
        CredentialData memory data = _credentials[tokenId];
        return (
            data.recipient,
            data.credentialType,
            data.achievementHash,
            data.issuedAt,
            data.revoked
        );
    }
}
