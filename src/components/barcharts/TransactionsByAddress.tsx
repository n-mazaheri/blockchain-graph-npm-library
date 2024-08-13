import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface TransactionsByAddressProps {
  transactions: Transaction[];
  inputAddress: string;
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const TransactionsByAddress: React.FC<TransactionsByAddressProps> = ({
  transactions,
  inputAddress,
  width = 800,
  height = 600,
}) => {
  const data = transactions.reduce((acc, tx) => {
    const address = tx.to === inputAddress ? tx.from : tx.to;
    const existing = acc.find((item) => item.address === address);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ address, count: 1 });
    }
    return acc;
  }, [] as { address: string; count: number }[]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="address" tick={false} /> {/* Hide the X-axis ticks */}
        <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Bar dataKey="count" fill="#ff8042" name="Transactions" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionsByAddress;
