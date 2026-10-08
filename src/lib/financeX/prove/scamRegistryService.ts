import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, POLYGON_AMOY_CONFIG, getExplorerTxUrl } from './network';
import { hashIdentifier } from './hashing';

export interface RegistryQueryResult {
  isRegistered: boolean;
  scamHash: string;
  identifierType?: string;
  sourceRefHash?: string;
  registeredAt?: string;
  revoked?: boolean;
  contractAddress: string;
  networkName: string;
  message: string;
}

export interface RegisterResult {
  status: 'REGISTERED' | 'FAILED' | 'REJECTED' | 'ALREADY_REGISTERED';
  scamHash?: string;
  txHash?: string;
  explorerUrl?: string;
  message: string;
}

const SCAM_REGISTRY_ABI = [
  'function registerScamHash(bytes32 scamHash, bytes32 identifierType, bytes32 sourceRefHash) external',
  'function revokeScamHash(bytes32 scamHash) external',
  'function queryScamHash(bytes32 scamHash) external view returns (bool isRegistered, bytes32 identifierType, bytes32 sourceRefHash, uint256 registeredAt, bool revoked)',
  'event ScamHashRegistered(bytes32 indexed scamHash, bytes32 indexed identifierType, bytes32 sourceRefHash, uint256 timestamp)',
];

export class ScamRegistryService {
  private contractAddress = CONTRACT_ADDRESSES.scamRegistry;

  public async queryScamHash(
    scamHashOrIdentifier: string,
    type: 'URL' | 'PHONE' | 'UPI' | 'WALLET' | 'REPORT' = 'URL'
  ): Promise<RegistryQueryResult> {
    const scamHash = scamHashOrIdentifier.startsWith('0x')
      ? scamHashOrIdentifier
      : hashIdentifier(scamHashOrIdentifier, type);

    try {
      const provider = new ethers.JsonRpcProvider(
        POLYGON_AMOY_CONFIG.rpcUrls[0],
        { name: 'amoy', chainId: 80002 },
        { staticNetwork: true }
      );
      const contract = new ethers.Contract(this.contractAddress, SCAM_REGISTRY_ABI, provider);

      const res = await contract.queryScamHash(scamHash);

      const isRegistered = Boolean(res.isRegistered || res[0]);
      const identifierTypeBytes = res.identifierType || res[1];
      const sourceRefHash = res.sourceRefHash || res[2];
      const registeredAtNum = Number(res.registeredAt || res[3]);
      const revoked = Boolean(res.revoked || res[4]);

      return {
        isRegistered,
        scamHash,
        identifierType: type,
        sourceRefHash: isRegistered ? sourceRefHash : undefined,
        registeredAt: isRegistered ? new Date(registeredAtNum * 1000).toISOString() : undefined,
        revoked,
        contractAddress: this.contractAddress,
        networkName: POLYGON_AMOY_CONFIG.chainName,
        message: isRegistered
          ? `Identifier hash reported and registered in FinanceX ScamRegistry.`
          : `No registry entry found for this identifier hash.`,
      };
    } catch (err: any) {
      return {
        isRegistered: false,
        scamHash,
        contractAddress: this.contractAddress,
        networkName: POLYGON_AMOY_CONFIG.chainName,
        message: `Query error: ${err.message || 'Scam hash not found'}`,
      };
    }
  }

  /**
   * Queries neutral on-chain registry for a scam identifier hash (URL, Phone, UPI, Wallet).
   */
  public async queryScamHashOnChain(
    identifier: string,
    type: 'URL' | 'PHONE' | 'UPI' | 'WALLET' | 'REPORT'
  ): Promise<RegistryQueryResult> {
    return this.queryScamHash(identifier, type);
  }

  /**
   * Registers a verified scam hash (authorized issuer only).
   */
  public async registerScamHash(
    identifier: string,
    type: 'URL' | 'PHONE' | 'UPI' | 'WALLET' | 'REPORT',
    sourceRefHash: string
  ): Promise<RegisterResult> {
    const scamHash = hashIdentifier(identifier, type);
    const identifierTypeBytes = ethers.encodeBytes32String(type);

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      return {
        status: 'FAILED',
        scamHash,
        message: 'No EVM wallet found. Connected authorized issuer wallet required.',
      };
    }

    try {
      const ethereum = (window as any).ethereum;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(this.contractAddress, SCAM_REGISTRY_ABI, signer);

      const tx = await contract.registerScamHash(scamHash, identifierTypeBytes, sourceRefHash);
      const receipt = await tx.wait();

      const txHash = receipt.hash;
      const explorerUrl = getExplorerTxUrl(txHash);

      return {
        status: 'REGISTERED',
        scamHash,
        txHash,
        explorerUrl,
        message: 'Scam hash registered successfully in ScamRegistry on Polygon Amoy!',
      };
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes('user rejected')) {
        return {
          status: 'REJECTED',
          scamHash,
          message: 'Registry transaction rejected by user.',
        };
      }
      return {
        status: 'FAILED',
        scamHash,
        message: err.message || 'Scam registration failed on Polygon Amoy.',
      };
    }
  }
}

export const scamRegistryService = new ScamRegistryService();
