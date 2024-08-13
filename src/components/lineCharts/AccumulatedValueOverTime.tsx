import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../utils';

interface AccumulatedValueOverTimeProps {
  transactions: Transaction[];
  token: string;
  timeSlot: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const AccumulatedValueOverTime: React.FC<AccumulatedValueOverTimeProps> = ({
  transactions,
  token,
  timeSlot,
  width = 800,
  height = 600,
}) => {
  const filteredTransactions = transactions.filter((tx) => tx.token === token);

  const data = filteredTransactions.reduce((acc, tx) => {
    const date = new Date(tx.time!);
    let value = parseFloat(tx.value);

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
      existing.value += value;
    } else {
      acc.push({ time: key, value });
    }
    return acc;
  }, [] as { time: string; value: number }[]);

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" label={{ value: 'Time', position: 'insideBottom', offset: -5 }} />
        <YAxis label={{ value: 'Accumulated Value', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend layout="horizontal" align="center" verticalAlign="top" />
        <Line type="monotone" dataKey="value" stroke="#8884d8" name={`Accumulated Value (${token})`} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AccumulatedValueOverTime;
