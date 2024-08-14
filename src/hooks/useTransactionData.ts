import { useState } from 'react';
import { fetchEthereumTransactions, FetchOptions, Transaction } from '../utils';

export function useTransactionData(alchemyApiKey: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = (options: FetchOptions, address: string) => {
    // Clear previous data and error
    setData([]);
    setError(null);

    if (address) {
      setLoading(true);
      fetchEthereumTransactions(address, alchemyApiKey, options)
        .then((transactions) => {
          setData(transactions);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  };

  return { data, loading, error, fetch };
}
