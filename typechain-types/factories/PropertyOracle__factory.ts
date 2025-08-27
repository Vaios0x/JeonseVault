import type { PropertyOracle } from '../contracts/PropertyOracle';

export interface PropertyOracle__factory {
  connect(address: string): PropertyOracle;
  deploy(): Promise<PropertyOracle>;
}
