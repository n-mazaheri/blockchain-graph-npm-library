export type Transaction = {
  from: string;
  to: string;
  value: number;
};

export const fetchTransactions = async (address: string): Promise<Transaction[]> => {
  // Mock data or real API call
  return [
    { from: '0x1', to: '0x2', value: 1 },
    { from: '0x2', to: '0x3', value: 2 },
  ];
};
