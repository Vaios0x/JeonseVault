import type { BigNumberish } from "ethers";
import { JeonseVault__factory } from "./factories/JeonseVault__factory";
import { InvestmentPool__factory } from "./factories/InvestmentPool__factory";
import { ComplianceModule__factory } from "./factories/ComplianceModule__factory";
import { PropertyOracle__factory } from "./factories/PropertyOracle__factory";

export interface TypedEventFilter<_EventArgsArray, _EventArgsObject extends Record<string, any> = Record<string, any>> {}

export interface TypedEvent<EventArgs extends Record<string, any> = Record<string, any>> {
  args: EventArgs;
}

export interface TypedListener<EventArgsArray extends Array<any>, EventArgsObject extends Record<string, any> = Record<string, any>> {
  (...listenerArg: [...EventArgsArray, TypedEvent<EventArgsObject>]): void;
}

export interface MinEthersFactory<C, ARGS> {
  deploy(...args: ARGS[]): Promise<C>;
}

export interface GetContractType {
  contracts: {
    "JeonseVault": any;
    "InvestmentPool": any;
    "ComplianceModule": any;
    "PropertyOracle": any;
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

// Contract interfaces are now defined in their respective files
// Factory classes are now defined in their respective files
