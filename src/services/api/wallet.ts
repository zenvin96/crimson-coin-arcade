import { api } from './client';
import { WalletBalance } from './types';

export const walletApi = {
  /**
   * Get wallet balance
   * @returns Current wallet balance
   */
  async getBalance(): Promise<WalletBalance> {
    return await api.get<WalletBalance>('/wallet/balance');
  },
};