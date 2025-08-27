import type { BigNumberish } from "ethers";
import type { TypedEvent, TypedEventFilter, TypedListener } from "./common";

export interface InvestmentPool {
  // Basic contract interface
  address: string;
  
  // Add methods as needed for your application
  invest(amount: BigNumberish): Promise<any>;
  withdraw(amount: BigNumberish): Promise<any>;
  getBalance(): Promise<BigNumberish>;
  
  // Event listeners
  on(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  once(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeListener(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeAllListeners(event?: TypedEventFilter<any, any>): this;
}
