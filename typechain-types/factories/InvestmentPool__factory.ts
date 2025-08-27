import type { InvestmentPool } from '../InvestmentPool';

export class InvestmentPool__factory {
  static abi = [
    {
      "inputs": [],
      "name": "getTotalPoolStats",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserInvestments",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  static connect(address: string): InvestmentPool {
    // Mock implementation for build purposes
    return {
      address,
      invest: async () => ({} as any),
      withdraw: async () => ({} as any),
      getBalance: async () => (0n as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as InvestmentPool;
  }

  static deploy(): Promise<InvestmentPool> {
    // Mock implementation for build purposes
    return Promise.resolve({
      address: '0x0000000000000000000000000000000000000000',
      invest: async () => ({} as any),
      withdraw: async () => ({} as any),
      getBalance: async () => (0n as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as InvestmentPool);
  }
}
