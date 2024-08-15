import { useState } from 'react';
import { fetchTransactions, FetchOptions, Transaction } from '../utils';

export function useTransactionData(alchemyApiKey: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = (
    address: string,
    network: 'eth-mainnet' | 'bsc-mainnet' | 'polygon-mainnet' = 'eth-mainnet', // Add the network parameter
    options: FetchOptions = {}
  ) => {
    // Clear previous data and error
    setData([]);
    setError(null);

    if (address) {
      setLoading(true);
      fetchTransactions(address, alchemyApiKey, network, options)
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
