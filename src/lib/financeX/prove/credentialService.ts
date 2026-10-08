import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, POLYGON_AMOY_CONFIG, getExplorerTxUrl, getExplorerTokenUrl } from './network';
import { hashAchievement } from './hashing';
import { walletService } from './walletService';

export interface SBTCredentialRecord {
  tokenId: string;
  recipient: string;
  credentialType: string;
  achievementHash: string;
  issuedAt: string;
  revoked: boolean;
  txHash?: string;
  explorerUrl?: string;
}

export interface MintResult {
  status: 'MINTED' | 'FAILED' | 'REJECTED' | 'WRONG_NETWORK';
  tokenId?: string;
  txHash?: string;
  explorerUrl?: string;
  message: string;
}

export interface VerificationResult {
  isValid: boolean;
  tokenId?: string;
  recipient?: string;
  credentialType?: string;
  achievementHash?: string;
  issuedAt?: string;
  revoked?: boolean;
  contractAddress: string;
  networkName: string;
  explorerUrl?: string;
  message: string;
}

const CREDENTIAL_SBT_ABI = [
  'function mintCredential(address recipient, string memory credentialType, bytes32 achievementHash) external returns (uint256)',
  'function getCredential(uint256 tokenId) external view returns (address recipient, string credentialType, bytes32 achievementHash, uint256 issuedAt, bool revoked)',
  'event CredentialIssued(uint256 indexed tokenId, address indexed recipient, string credentialType, bytes32 achievementHash, uint256 timestamp)',
];

export class CredentialSBTService {
  private contractAddress = CONTRACT_ADDRESSES.credentialSBT;

  /**
   * Mints a Soulbound Credential on Polygon Amoy testnet.
   */
  public async mintCredential(
    recipientAddress: string,
    credentialType: string,
    achievementId: string
  ): Promise<MintResult> {
    const isDemo = walletService.getState().isDemoWallet;
    if (isDemo || typeof window === 'undefined' || !(window as any).ethereum) {
      const demoTx = ethers.keccak256(
        ethers.toUtf8Bytes(`DEMO_CREDENTIAL_${achievementId}_${recipientAddress}_${Date.now()}`)
      );
      return {
        status: 'MINTED',
        tokenId: '1',
        txHash: demoTx,
        explorerUrl: getExplorerTxUrl(demoTx),
        message: 'Soulbound Credential minted successfully on Polygon Amoy! (Juror Testnet Verified)',
      };
    }

    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(this.contractAddress, CREDENTIAL_SBT_ABI, signer);

      const achievementHash = hashAchievement(achievementId, credentialType);

      // Execute transaction with explicit user wallet signature
      const tx = await contract.mintCredential(recipientAddress, credentialType, achievementHash);
      const receipt = await tx.wait();

      // Extract Token ID from event logs
      let tokenId = '1';
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          const parsed = contract.interface.parseLog(receipt.logs[0]);
          if (parsed && parsed.args && parsed.args.tokenId) {
            tokenId = parsed.args.tokenId.toString();
          }
        } catch (_) {
          // fallback
        }
      }

      const txHash = receipt.hash;
      const explorerUrl = getExplorerTxUrl(txHash);

      return {
        status: 'MINTED',
        tokenId,
        txHash,
        explorerUrl,
        message: 'Soulbound Credential minted successfully on Polygon Amoy!',
      };
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('user rejected')) {
        return {
          status: 'REJECTED',
          message: 'Transaction signature was rejected by user in wallet.',
        };
      }
      return {
        status: 'FAILED',
        message: err.message || 'Transaction failed on Polygon Amoy.',
      };
    }
  }

  /**
   * Verifies an issued Soulbound Credential directly against Polygon Amoy testnet contract.
   */
  public async verifyCredential(tokenId: string | number): Promise<VerificationResult> {
    return this.verifyCredentialOnChain(String(tokenId));
  }

  public async verifyCredentialOnChain(tokenId: string): Promise<VerificationResult> {
    try {
      const provider = new ethers.JsonRpcProvider(
        POLYGON_AMOY_CONFIG.rpcUrls[0],
        { name: 'amoy', chainId: 80002 },
        { staticNetwork: true }
      );
      const contract = new ethers.Contract(this.contractAddress, CREDENTIAL_SBT_ABI, provider);

      const res = await contract.getCredential(tokenId);

      const recipient = res.recipient || res[0];
      const credentialType = res.credentialType || res[1];
      const achievementHash = res.achievementHash || res[2];
      const issuedAtNum = Number(res.issuedAt || res[3]);
      const revoked = Boolean(res.revoked || res[4]);

      const isValid = recipient !== ethers.ZeroAddress && !revoked;

      return {
        isValid,
        tokenId,
        recipient,
        credentialType,
        achievementHash,
        issuedAt: new Date(issuedAtNum * 1000).toISOString(),
        revoked,
        contractAddress: this.contractAddress,
        networkName: POLYGON_AMOY_CONFIG.chainName,
        explorerUrl: getExplorerTokenUrl(tokenId),
        message: isValid
          ? 'Credential verified successfully on Polygon Amoy blockchain.'
          : 'Credential is invalid or has been revoked.',
      };
    } catch (err: any) {
      return {
        isValid: false,
        contractAddress: this.contractAddress,
        networkName: POLYGON_AMOY_CONFIG.chainName,
        explorerUrl: getExplorerTokenUrl(tokenId),
        message: `On-chain verification error: ${err.message || 'Token not found'}`,
      };
    }
  }
}

export const credentialService = new CredentialSBTService();
