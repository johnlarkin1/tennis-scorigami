"use client";

import type { NodeDTO } from "@/lib/types";
import React, { createContext, useContext, useState, ReactNode } from "react";

type GraphLink = { source: number; target: number };

export interface GraphData {
  nodes: NodeDTO[];
  links: GraphLink[];
}

interface GraphContextType {
  // Graph data
  data: GraphData;
  setData: (data: GraphData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Selected node state
  selectedSequenceId: number | null;
  setSelectedSequenceId: (id: number | null) => void;
  
  // Discovery modal state
  discoveryModalOpen: boolean;
  setDiscoveryModalOpen: (open: boolean) => void;
  discoveredNode: NodeDTO | null;
  setDiscoveredNode: (node: NodeDTO | null) => void;
  
  // Computed values
  hasUnscoredNodes: boolean;
  maxDepth: number;
}

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const useGraphContext = () => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("useGraphContext must be used within a GraphProvider");
  }
  return context;
};

interface GraphProviderProps {
  children: ReactNode;
  maxDepth: number;
}

export const GraphProvider: React.FC<GraphProviderProps> = ({ children, maxDepth }) => {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState<number | null>(null);
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);
  const [discoveredNode, setDiscoveredNode] = useState<NodeDTO | null>(null);
  
  const hasUnscoredNodes = React.useMemo(() => {
    return data.nodes.some((node) => !node.played && node.id !== 0);
  }, [data.nodes]);
  
  const value: GraphContextType = {
    data,
    setData,
    loading,
    setLoading,
    selectedSequenceId,
    setSelectedSequenceId,
    discoveryModalOpen,
    setDiscoveryModalOpen,
    discoveredNode,
    setDiscoveredNode,
    hasUnscoredNodes,
    maxDepth,
  };
  
  return <GraphContext.Provider value={value}>{children}</GraphContext.Provider>;
};