import React from 'react';
import { useTransactionData } from '../hooks/useTransactionData';

type TransactionGraphProps = {
  address: string;
};

const TransactionGraph: React.FC<TransactionGraphProps> = ({ address }) => {
  const { data, loading, error } = useTransactionData(address);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading transactions</p>;

  // Render the graph using your preferred library (e.g., D3.js, Chart.js, Visx)
  return (
    <div>
      {/* Graph rendering logic goes here */}
      <p>Graph for address: {address}</p>
    </div>
  );
};

export default TransactionGraph;
