import type { InvestmentPool } from '../contracts/InvestmentPool';

export interface InvestmentPool__factory {
  connect(address: string): InvestmentPool;
  deploy(): Promise<InvestmentPool>;
}
