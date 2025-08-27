import type { PropertyOracle } from '../contracts/PropertyOracle';

export class PropertyOracle__factory {
  static connect(address: string): PropertyOracle {
    // Mock implementation for build purposes
    return {
      address,
      getPropertyValue: async () => (0n as any),
      updatePropertyValue: async () => ({} as any),
      verifyProperty: async () => true,
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as PropertyOracle;
  }

  static deploy(): Promise<PropertyOracle> {
    // Mock implementation for build purposes
    return Promise.resolve({
      address: '0x0000000000000000000000000000000000000000',
      getPropertyValue: async () => (0n as any),
      updatePropertyValue: async () => ({} as any),
      verifyProperty: async () => true,
      on: () => this as any,
      once: () => this as any,
      removeListener: () => this as any,
      removeAllListeners: () => this as any,
    } as PropertyOracle);
  }
}
