import type { BigNumberish } from "ethers";
import type { TypedEvent, TypedEventFilter, TypedListener } from "../common";

export interface ComplianceModule {
  // Basic contract interface
  address: string;
  
  // Add methods as needed for your application
  verifyCompliance(user: string): Promise<boolean>;
  addComplianceRule(rule: string): Promise<any>;
  removeComplianceRule(ruleId: BigNumberish): Promise<any>;
  
  // Event listeners
  on(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  once(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeListener(event: TypedEventFilter<any, any>, listener: TypedListener<any, any>): this;
  removeAllListeners(event?: TypedEventFilter<any, any>): this;
}
