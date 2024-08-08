import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import TransactionGraph from '../src/components/TransactionGraph';

test('renders loading state initially', () => {
  render(<TransactionGraph address="0x123" />);
  expect(screen.getByText(/Loading/i)).toBeInTheDocument();
});
