import type { ComplianceModule } from '../contracts/ComplianceModule';

export class ComplianceModule__factory {
  static abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "verifyCompliance",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "rule",
          "type": "string"
        }
      ],
      "name": "addComplianceRule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "ruleId",
          "type": "uint256"
        }
      ],
      "name": "removeComplianceRule",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  static connect(address: string): ComplianceModule {
    // Mock implementation for build purposes
    return {
      address,
      verifyCompliance: async () => true,
      addComplianceRule: async () => ({} as any),
      removeComplianceRule: async () => ({} as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as ComplianceModule;
  }

  static deploy(): Promise<ComplianceModule> {
    // Mock implementation for build purposes
    return Promise.resolve({
      address: '0x0000000000000000000000000000000000000000',
      verifyCompliance: async () => true,
      addComplianceRule: async () => ({} as any),
      removeComplianceRule: async () => ({} as any),
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as ComplianceModule);
  }
}
