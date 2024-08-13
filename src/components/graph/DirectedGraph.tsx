import React, { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Web3 from 'web3';
import { Transaction } from '../../utils';

interface DirectedGraphProps {
  transactions: Transaction[];
  token: string; // Token name filter
  alchemyApiKey: string;
  width?: number; // Optional width of the chart
  height?: number; // Optional height of the chart
}

const DirectedGraph: React.FC<DirectedGraphProps> = ({
  transactions,
  token,
  alchemyApiKey,
  width = 800,
  height = 600,
}) => {
  const [graphData, setGraphData] = useState<{
    nodes: { id: string }[];
    links: { source: string; target: string; value: number }[];
  }>({ nodes: [], links: [] });

  useEffect(() => {
    const web3 = new Web3(Web3.givenProvider || 'https://eth-mainnet.g.alchemy.com/v2/' + alchemyApiKey);
    const filteredTransactions = transactions.filter((tx) => tx.token === token);

    const nodes = new Map<string, { id: string }>();
    const links = filteredTransactions.map((tx) => {
      // Add nodes with distinct color group for contracts vs wallets
      nodes.set(tx.from, { id: tx.from });
      nodes.set(tx.to, { id: tx.to });

      return {
        source: tx.from,
        target: tx.to,
        value: parseFloat(tx.value),
      };
    });

    setGraphData({
      nodes: Array.from(nodes.values()),
      links,
    });
  }, [transactions, token]);

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      <ForceGraph2D
        graphData={graphData}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Draw node circle
          const radius = 5;
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = 'green';
          ctx.fill();

          // Draw node label
          const label = node.id as string;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'black';
          ctx.fillText(label.slice(0, 6) + '...', node.x!, node.y! + radius + fontSize);
        }}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link) => Math.log(link.value + 1)}
        linkColor={() => 'rgba(0, 0, 0, 0.6)'}
        nodeRelSize={8}
        width={width}
        height={height}
      />
    </div>
  );
};

export default DirectedGraph;
