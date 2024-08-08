import { useState, useEffect } from 'react';
import { fetchTransactions, Transaction } from '../utils';

type UseTransactionData = {
  data: Transaction[] | null;
  loading: boolean;
  error: Error | null;
};

export const useTransactionData = (address: string): UseTransactionData => {
  const [data, setData] = useState<Transaction[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const transactions = await fetchTransactions(address);
        setData(transactions);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [address]);

  return { data, loading, error };
};
