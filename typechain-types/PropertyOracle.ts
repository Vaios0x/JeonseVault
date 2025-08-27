import type { BigNumberish } from "ethers";
import type { TypedEvent, TypedEventFilter, TypedListener } from "./common";

export interface PropertyOracle {
  // Basic contract interface
  address: string;
  
  // Add methods as needed for your application
  getPropertyValue(propertyId: string): Promise<BigNumberish>;
  updatePropertyValue(propertyId: string, value: BigNumberish): Promise<any>;
  verifyProperty(propertyId: string): Promise<boolean>;
  
  // Event listeners
  on(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  once(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeListener(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeAllListeners(event?: TypedEventFilter<any, any>): this;
}
