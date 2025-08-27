import type { JeonseVault } from '../JeonseVault';

export class JeonseVault__factory {
  static abi = [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "createDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "depositId",
          "type": "uint256"
        }
      ],
      "name": "withdrawDeposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "depositId",
          "type": "uint256"
        }
      ],
      "name": "getDepositInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startDate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endDate",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
              "type": "bool"
            }
          ],
          "internalType": "struct JeonseVault.DepositInfo",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

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
