import type { BigNumberish } from "ethers";
import type { TypedEvent, TypedEventFilter, TypedListener } from "../common";

export interface JeonseVault {
  // Basic contract interface
  address: string;
  
  // Add methods as needed for your application
  createDeposit(amount: BigNumberish): Promise<any>;
  withdrawDeposit(depositId: BigNumberish): Promise<any>;
  getDepositInfo(depositId: BigNumberish): Promise<any>;
  
  // Event listeners
  on(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  once(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeListener(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeAllListeners(event?: TypedEventFilter<any, any>): this;
}
