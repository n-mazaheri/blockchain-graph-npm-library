import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface TransactionsByTokenProps {
  transactions: Transaction[];
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const normalizeTokenName = (tokenName: string) => {
  return tokenName
    .normalize('NFKD') // Normalize special characters like 'E TH' and 'EТH'
    .replace(/[^\w]/g, '') // Remove all non-alphanumeric characters
    .toUpperCase(); // Convert to uppercase for uniformity
};

const TransactionsByToken: React.FC<TransactionsByTokenProps> = ({ transactions, width = 800, height = 600 }) => {
  const data = transactions.reduce((acc, tx) => {
    // Normalize the token name
    const tokenName = normalizeTokenName(tx.token);

    const existing = acc.find((item) => item.token === tokenName);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ token: tokenName, count: 1 });
    }
    return acc;
  }, [] as { token: string; count: number }[]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="token" label={{ value: 'Token Name', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Bar dataKey="count" fill="#8884d8" name="Transactions" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TransactionsByToken;
