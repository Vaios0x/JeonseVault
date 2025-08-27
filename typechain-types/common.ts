import type { BigNumberish } from "ethers";

export interface TypedEventFilter<_EventArgsArray, _EventArgsObject> {}

export interface TypedEvent<EventArgs extends Record<string, any> = Record<string, any>> {
  args: EventArgs;
}

export interface TypedListener<EventArgsArray extends Array<any>, EventArgsObject> {
  (...listenerArg: [...EventArgsArray, TypedEvent<EventArgsObject>]): void;
}

export interface MinEthersFactory<C, ARGS> {
  deploy(...args: ARGS[]): Promise<C>;
}

export interface GetContractType {
  contracts: {
    "JeonseVault": JeonseVault;
    "InvestmentPool": InvestmentPool;
    "ComplianceModule": ComplianceModule;
    "PropertyOracle": PropertyOracle;
  };
}

export interface GetContractTypeFromFactory<F> {
  contracts: {
    [K in keyof F]: F[K] extends MinEthersFactory<infer C, any> ? C : never;
  };
}

export interface GetContractTypeFromAddresses {
  contracts: {
    [K: string]: any;
  };
}

export interface GetFactoriesType {
  contracts: {
    "JeonseVault": JeonseVault__factory;
    "InvestmentPool": InvestmentPool__factory;
    "ComplianceModule": ComplianceModule__factory;
    "PropertyOracle": PropertyOracle__factory;
  };
}

// Basic contract interfaces
export interface JeonseVault {
  // Add basic methods as needed
}

export interface InvestmentPool {
  // Add basic methods as needed
}

export interface ComplianceModule {
  // Add basic methods as needed
}

export interface PropertyOracle {
  // Add basic methods as needed
}

// Factory interfaces
export interface JeonseVault__factory {
  connect(address: string): JeonseVault;
  deploy(): Promise<JeonseVault>;
}

export interface InvestmentPool__factory {
  connect(address: string): InvestmentPool;
  deploy(): Promise<InvestmentPool>;
}

export interface ComplianceModule__factory {
  connect(address: string): ComplianceModule;
  deploy(): Promise<ComplianceModule>;
}

export interface PropertyOracle__factory {
  connect(address: string): PropertyOracle;
  deploy(): Promise<PropertyOracle>;
}
