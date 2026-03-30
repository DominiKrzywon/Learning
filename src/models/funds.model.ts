export interface GetFundsResponse {
  funds: number;
}

export interface UpdateFundsResponse {
  success: boolean;
  message: string;
  newBalance: number;
}

export interface FundsHistoryEntry {
  userId: number;
  amount: number;
  type: string;
  timestamp: string;
  description: string;
}

export interface GetFundsHistoryResponse {
  history: FundsHistoryEntry[];
}
