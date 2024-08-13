import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface TransactionsOverTimeProps {
  transactions: Transaction[];
  timeSlot: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  token?: string; // Optional token name filter
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const TransactionsOverTime: React.FC<TransactionsOverTimeProps> = ({
  transactions,
  timeSlot,
  token,
  width = 800,
  height = 600,
}) => {
  // Filter transactions by the provided token name, if any
  const filteredTransactions = token ? transactions.filter((tx) => tx.token === token) : transactions;

  const data = filteredTransactions.reduce((acc, tx) => {
    const date = new Date(tx.time!);

    // Group transactions based on the selected time slot
    let key: string;
    if (timeSlot === 'minutely') {
      key = `${date.toISOString().split(':')[0]}:${date.getMinutes()}`;
    } else if (timeSlot === 'hourly') {
      key = date.toISOString().split(':')[0]; // e.g., "2023-08-10T13"
    } else if (timeSlot === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (timeSlot === 'weekly') {
      const weekNumber = Math.ceil(date.getDate() / 7);
      key = `${date.getFullYear()}-W${weekNumber}`;
    } else {
      key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    }

    const existing = acc.find((item) => item.time === key);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ time: key, count: 1 });
    }
    return acc;
  }, [] as { time: string; count: number }[]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Number of Transactions', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Line type="monotone" dataKey="count" stroke="#8884d8" name={`Transactions${token ? ` (${token})` : ''}`} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TransactionsOverTime;