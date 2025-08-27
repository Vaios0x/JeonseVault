import type { ComplianceModule } from '../contracts/ComplianceModule';

export interface ComplianceModule__factory {
  connect(address: string): ComplianceModule;
  deploy(): Promise<ComplianceModule>;
}
