export const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  chainIdHex: '0x13882',
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: [
    process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC || 'https://rpc-amoy.polygon.technology',
  ],
  blockExplorerUrls: ['https://amoy.polygonscan.com'],
};

export const CONTRACT_ADDRESSES = {
  credentialSBT:
    process.env.NEXT_PUBLIC_CREDENTIAL_SBT_ADDRESS || '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  evidenceAnchor:
    process.env.NEXT_PUBLIC_EVIDENCE_ANCHOR_ADDRESS || '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  scamRegistry:
    process.env.NEXT_PUBLIC_SCAM_REGISTRY_ADDRESS || '0xbD770416a3345F91E4B345003a74Da3185973913',
};

export function isPolygonAmoy(chainId?: number | string): boolean {
  if (!chainId) return false;
  if (typeof chainId === 'string') {
    return parseInt(chainId, 16) === 80002 || parseInt(chainId, 10) === 80002;
  }
  return chainId === 80002;
}

export function getExplorerTxUrl(txHash: string): string {
  if (!txHash) return '#';
  return `${POLYGON_AMOY_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  if (!address) return '#';
  return `${POLYGON_AMOY_CONFIG.blockExplorerUrls[0]}/address/${address}`;
}

export function getExplorerTokenUrl(tokenId: string): string {
  if (!tokenId) return '#';
  return `${POLYGON_AMOY_CONFIG.blockExplorerUrls[0]}/token/${CONTRACT_ADDRESSES.credentialSBT}?a=${tokenId}`;
}
