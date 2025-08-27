import type { JeonseVault } from '../contracts/JeonseVault';

export class JeonseVault__factory {
  static connect(address: string): JeonseVault {
    // Mock implementation for build purposes
    return {
      address,
      createDeposit: async () => ({} as any),
      withdrawDeposit: async () => ({} as any),
      getDepositInfo: async () => ({} as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as JeonseVault;
  }

  static deploy(): Promise<JeonseVault> {
    // Mock implementation for build purposes
    return Promise.resolve({
      address: '0x0000000000000000000000000000000000000000',
      createDeposit: async () => ({} as any),
      withdrawDeposit: async () => ({} as any),
      getDepositInfo: async () => ({} as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as JeonseVault);
  }
}
