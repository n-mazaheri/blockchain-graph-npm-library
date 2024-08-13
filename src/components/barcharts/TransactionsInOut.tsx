import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface TransactionsInOutProps {
  transactions: Transaction[];
  inputAddress: string;
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const TransactionsInOut: React.FC<TransactionsInOutProps> = ({
  transactions,
  inputAddress,
  width = 800,
  height = 600,
}) => {
  const data = transactions.reduce((acc, tx) => {
    const direction = tx.to.toLowerCase() === inputAddress.toLowerCase() ? 'Incoming' : 'Outgoing';
    const existing = acc.find((item) => item.direction === direction);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ direction, count: 1 });
    }
    return acc;
  }, [] as { direction: string; count: number }[]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="direction" label={{ value: 'IN/OUT', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Bar dataKey="count" fill="#ffc658" name="Transactions" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionsInOut;
