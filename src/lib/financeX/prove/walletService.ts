import { POLYGON_AMOY_CONFIG, isPolygonAmoy } from './network';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isWrongNetwork: boolean;
  isDemoWallet?: boolean;
  error: string | null;
}

export class WalletService {
  private state: WalletState = {
    address: null,
    chainId: null,
    isConnected: false,
    isWrongNetwork: false,
    isDemoWallet: false,
    error: null,
  };

  private listeners: Array<(state: WalletState) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const isDemo = localStorage.getItem('financex_demo_wallet') === 'true';
        if (isDemo) {
          this.state = {
            address: '0x71C665C34C41E922338A4991207eE699A31443F9',
            chainId: 80002,
            isConnected: true,
            isWrongNetwork: false,
            isDemoWallet: true,
            error: null,
          };
        }
      } catch (_) {}

      if ((window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        ethereum.on('accountsChanged', (accounts: string[]) => {
          this.handleAccountsChanged(accounts);
        });
        ethereum.on('chainChanged', (chainIdHex: string) => {
          this.handleChainChanged(chainIdHex);
        });
      }
    }
  }

  public connectDemoJurorWallet(): WalletState {
    this.state = {
      address: '0x71C665C34C41E922338A4991207eE699A31443F9',
      chainId: 80002,
      isConnected: true,
      isWrongNetwork: false,
      isDemoWallet: true,
      error: null,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('financex_demo_wallet', 'true');
      } catch (_) {}
    }
    this.notify();
    return this.state;
  }

  public disconnect(): WalletState {
    this.state = {
      address: null,
      chainId: null,
      isConnected: false,
      isWrongNetwork: false,
      isDemoWallet: false,
      error: null,
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('financex_demo_wallet');
      } catch (_) {}
    }
    this.notify();
    return this.state;
  }

  public listen(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
  }

  public getState(): WalletState {
    return this.state;
  }

  public async getAccount(): Promise<string | null> {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts: string[] = await ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts[0]) {
          this.state.address = accounts[0];
          this.state.isConnected = true;
          return accounts[0];
        }
      } catch (_) {
        // ignore
      }
    }
    return this.state.address;
  }

  public async connectWallet(): Promise<WalletState> {
    return this.connect();
  }

  public async connect(): Promise<WalletState> {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      this.state = {
        ...this.state,
        error: 'No Web3 wallet extension found. Please install MetaMask or another EVM wallet.',
      };
      this.notify();
      return this.state;
    }

    try {
      const ethereum = (window as any).ethereum;
      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const chainIdHex: string = await ethereum.request({
        method: 'eth_chainId',
      });

      const chainId = parseInt(chainIdHex, 16);
      const isWrongNetwork = !isPolygonAmoy(chainId);

      this.state = {
        address: accounts[0] || null,
        chainId,
        isConnected: !!accounts[0],
        isWrongNetwork,
        error: isWrongNetwork ? 'Connected to wrong network. Polygon Amoy required.' : null,
      };

      if (isWrongNetwork) {
        await this.switchToPolygonAmoy();
      }

      this.notify();
      return this.state;
    } catch (err: any) {
      this.state = {
        ...this.state,
        error: err.message || 'Failed to connect wallet.',
      };
      this.notify();
      return this.state;
    }
  }

  public async switchToPolygonAmoy(): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).ethereum) return false;
    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY_CONFIG.chainIdHex }],
      });
      this.state = { ...this.state, isWrongNetwork: false, error: null };
      this.notify();
      return true;
    } catch (switchError: any) {
      // 4902 code indicates target chain has not been added to wallet
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: POLYGON_AMOY_CONFIG.chainIdHex,
                chainName: POLYGON_AMOY_CONFIG.chainName,
                nativeCurrency: POLYGON_AMOY_CONFIG.nativeCurrency,
                rpcUrls: POLYGON_AMOY_CONFIG.rpcUrls,
                blockExplorerUrls: POLYGON_AMOY_CONFIG.blockExplorerUrls,
              },
            ],
          });
          this.state = { ...this.state, isWrongNetwork: false, error: null };
          this.notify();
          return true;
        } catch (addError: any) {
          this.state = { ...this.state, error: addError.message || 'Could not add Polygon Amoy network.' };
          this.notify();
          return false;
        }
      }
      this.state = { ...this.state, error: switchError.message || 'Could not switch to Polygon Amoy network.' };
      this.notify();
      return false;
    }
  }

  private handleAccountsChanged(accounts: string[]) {
    this.state = {
      ...this.state,
      address: accounts[0] || null,
      isConnected: !!accounts[0],
    };
    this.notify();
  }

  private handleChainChanged(chainIdHex: string) {
    const chainId = parseInt(chainIdHex, 16);
    const isWrongNetwork = !isPolygonAmoy(chainId);
    this.state = {
      ...this.state,
      chainId,
      isWrongNetwork,
      error: isWrongNetwork ? 'Connected to wrong network. Polygon Amoy required.' : null,
    };
    this.notify();
  }

  public truncateAddress(address: string | null): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const walletService = new WalletService();
