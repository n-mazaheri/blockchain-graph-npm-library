import { useState, useEffect } from 'react';
import { fetchEthereumTransactions, Transaction } from '../utils';

export function useTransactionData(address: string, alchemyApiKey: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = () => {
    if (address) {
      setLoading(true);
      fetchEthereumTransactions(address, alchemyApiKey)
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
