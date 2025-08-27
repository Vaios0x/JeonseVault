import type { JeonseVault } from '../contracts/JeonseVault';

export interface JeonseVault__factory {
  connect(address: string): JeonseVault;
  deploy(): Promise<JeonseVault>;
}
