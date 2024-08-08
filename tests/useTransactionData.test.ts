import { renderHook, screen, waitFor } from '@testing-library/react';
import { useTransactionData } from '../src/hooks/useTransactionData';
import React from 'react';

test('fetches and returns transaction data', async () => {
  const { result } = renderHook(() => useTransactionData('0x123'));

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
