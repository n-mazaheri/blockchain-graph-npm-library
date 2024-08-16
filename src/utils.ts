export interface Transaction {
  from: string;
  to: string;
  value: string;
  token: string;
  category: string;
  time: Date | null;
}

interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
}

interface Transfer {
  from: string;
  to: string;
  value: string;
  asset: string;
  category: string;
  rawContract: {
    address: string;
  };
  erc721TokenId?: string;
  erc1155Metadata?: { tokenId: string; value: string }[];
  metadata?: { blockTimestamp: string };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchTokenMetadata = async (
  contractAddress: string,
  alchemyApiKey: string,
  network: string
): Promise<TokenMetadata | null> => {
  const url = `https://${network}.g.alchemy.com/v2/${alchemyApiKey}`;

  const data = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenMetadata',
    params: [contractAddress],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.result as TokenMetadata;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
};

export interface FetchOptions {
  startTime?: string;
  endTime?: string;
  maxNumber?: number;
  tokenAddresses?: string[];
  transactionType?: 'external' | 'erc20' | 'erc721' | 'erc1155';
  direction?: 'incoming' | 'outgoing';
  counterpartyAddress?: string;
  tokenType?: 'fungible' | 'non-fungible';
}

const isNonFungible = (tx: Transfer): boolean => {
  return (
    tx.category === 'erc721' ||
    (tx.category === 'erc1155' && (tx.erc1155Metadata?.some((meta) => meta.value === '1') ?? false))
  );
};

const isFungible = (tx: Transfer): boolean => {
  return (
    tx.category === 'erc20' ||
    (tx.category === 'erc1155' && (tx.erc1155Metadata?.some((meta) => meta.value !== '1') ?? false))
  );
};

export const fetchTransactions = async (
  address: string,
  alchemyApiKey: string,
  network:
    | 'eth-mainnet'
    | 'eth-goerli'
    | 'polygon-mainnet'
    | 'polygon-mumbai'
    | 'arbitrum-mainnet'
    | 'optimism-mainnet'
    | 'bsc-mainnet'
    | 'avax-mainnet'
    | 'base-mainnet' = 'eth-mainnet', // Add more networks here
  options: FetchOptions = {}
): Promise<Transaction[]> => {
  const { startTime, endTime, maxNumber, tokenAddresses, transactionType, direction, counterpartyAddress, tokenType } =
    options;
  const url = `https://${network}.g.alchemy.com/v2/${alchemyApiKey}`;

  const maxCountHex = maxNumber ? `0x${maxNumber.toString(16)}` : undefined;

  const fetchTransfers = async (params: object) => {
    const data = {
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [params],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.result.transfers as Transfer[];
  };

  try {
    const paramsFrom = {
      fromAddress: direction !== 'incoming' ? address : undefined,
      toAddress: direction === 'incoming' ? address : undefined,
      category: transactionType ? [transactionType] : ['external', 'erc20', 'erc721', 'erc1155'],
      withMetadata: true,
      excludeZeroValue: true,
      maxCount: maxCountHex,
      contractAddresses: tokenAddresses,
    };

    let transfersFrom = await fetchTransfers(paramsFrom);

    await delay(2000);

    const paramsTo = {
      fromAddress: direction === 'outgoing' ? address : undefined,
      toAddress: direction !== 'outgoing' ? address : undefined,
      category: transactionType ? [transactionType] : ['external', 'erc20', 'erc721', 'erc1155'],
      withMetadata: true,
      excludeZeroValue: true,
      maxCount: maxCountHex,
      contractAddresses: tokenAddresses,
    };

    let transfersTo = await fetchTransfers(paramsTo);

    let transfers =
      direction === 'incoming'
        ? transfersTo
        : direction === 'outgoing'
        ? transfersFrom
        : transfersFrom.concat(transfersTo);

    if (counterpartyAddress) {
      transfers = transfers.filter((tx) => tx.from === counterpartyAddress || tx.to === counterpartyAddress);
    }

    if (tokenType) {
      transfers = transfers.filter((tx) => (tokenType === 'fungible' ? isFungible(tx) : isNonFungible(tx)));
    }

    if (startTime || endTime) {
      const startTimestamp = startTime ? new Date(startTime).getTime() : 0;
      const endTimestamp = endTime ? new Date(endTime).getTime() : Number.MAX_SAFE_INTEGER;
      transfers = transfers.filter((tx) => {
        if (tx.metadata?.blockTimestamp) {
          const txTime = new Date(tx.metadata.blockTimestamp).getTime();
          return txTime >= startTimestamp && txTime <= endTimestamp;
        }
        return false;
      });
    }

    if (maxNumber && maxNumber > 0) {
      transfers = transfers.slice(0, maxNumber);
    }

    const formattedTransfers: Transaction[] = await Promise.all(
      transfers.map(async (tx) => {
        let tokenName = 'Unknown Token';

        // Determine the token name based on the network
        if (tx.category === 'external') {
          tokenName = network.includes('eth')
            ? 'ETH'
            : network.includes('polygon')
            ? 'MATIC'
            : network.includes('bsc')
            ? 'BNB'
            : network.includes('avax')
            ? 'AVAX'
            : network.includes('arbitrum')
            ? 'ARB'
            : network.includes('optimism')
            ? 'OP'
            : network.includes('base')
            ? 'ETH'
            : 'Unknown Token';
        } else {
          const metadata = await fetchTokenMetadata(tx.rawContract.address, alchemyApiKey, network);
          tokenName = metadata ? metadata.name : 'Unknown Token';
        }

        return {
          from: tx.from,
          to: tx.to,
          value: tx.value,
          token: tokenName,
          category: tx.category,
          time: tx?.metadata?.blockTimestamp ? new Date(tx?.metadata?.blockTimestamp) : null,
        };
      })
    );

    return formattedTransfers;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
