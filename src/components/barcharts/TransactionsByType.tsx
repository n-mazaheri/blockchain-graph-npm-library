import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface TransactionsByTypeProps {
  transactions: Transaction[];
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const TransactionsByType: React.FC<TransactionsByTypeProps> = ({ transactions, width = 800, height = 600 }) => {
  let data = transactions.reduce((acc, tx) => {
    const type = tx.category;
    const existing = acc.find((item) => item.type === type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: type, count: 1 });
    }
    return acc;
  }, [] as { type: string; count: number }[]);

  data = data.map((d) => {
    return { ...d, type: d.type == 'external' ? 'native' : d.type };
  });

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" label={{ value: 'Token Type', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Bar dataKey="count" fill="#82ca9d" name="Transactions" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionsByType;
