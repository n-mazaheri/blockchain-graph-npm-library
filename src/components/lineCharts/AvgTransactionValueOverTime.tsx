import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface AvgTransactionValueOverTimeProps {
  transactions: Transaction[];
  timeSlot: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  token?: string; // Optional token filter
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const AvgTransactionValueOverTime: React.FC<AvgTransactionValueOverTimeProps> = ({
  transactions,
  timeSlot,
  token,
  width = 800,
  height = 600,
}) => {
  const filteredTransactions = token ? transactions.filter((tx) => tx.token === token) : transactions;

  const data = filteredTransactions.reduce((acc, tx) => {
    const date = new Date(tx.time!);
    const value = parseFloat(tx.value);

    let key: string;
    if (timeSlot === 'minutely') {
      key = `${date.toISOString().split(':')[0]}:${date.getMinutes()}`;
    } else if (timeSlot === 'hourly') {
      key = date.toISOString().split(':')[0];
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
      existing.totalValue += value;
      existing.count += 1;
    } else {
      acc.push({ time: key, totalValue: value, count: 1 });
    }
    return acc;
  }, [] as { time: string; totalValue: number; count: number }[]);

  const formattedData = data.map((item) => ({
    time: item.time,
    avgValue: item.totalValue / item.count,
  }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Average Value', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Line
          type="monotone"
          dataKey="avgValue"
          stroke="#8884d8"
          name={`Avg Transaction Value${token ? ` (${token})` : ''}`}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AvgTransactionValueOverTime;
